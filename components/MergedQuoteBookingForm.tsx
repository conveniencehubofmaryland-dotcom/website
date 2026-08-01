'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BUNDLES } from '@/lib/bundles'
import BundleModal from './BundleModal'
import BookingCalendar from './BookingCalendar'

type Category = 'cleaning' | 'laundry' | 'mealprep' | 'nanny' | 'eldercare' | 'commercial' | 'special' | ''
type LineItem = { label: string; amount: number }

const CLOVER_LINK = 'https://link.clover.com/urlshortener/m92Kg8'

const SERVICE_MAP: Record<string, string> = {
  cleaning: 'cleaning',
  laundry: 'laundry',
  mealprep: 'culinary',
  nanny: 'care',
  eldercare: 'care',
  commercial: 'commercial',
  special: 'care',
}

const STEP_LABELS = ['Service', 'Details', 'Review', 'Contact', 'Booking']

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM',  '2:00 PM',  '3:00 PM',  '4:00 PM',
  '5:00 PM',  '6:00 PM',  '7:00 PM',  '8:00 PM', '9:00 PM',
]

const ADVANCE_NOTICE_IDS = new Set(['cleaning', 'culinary', 'laundry'])

const SERVICE_STATES = [
  { value: 'MD', label: 'Maryland' },
  { value: 'VA', label: 'Virginia' },
  { value: 'DC', label: 'Washington D.C.' },
]

const CATEGORY_TITLES: Record<string, string> = {
  cleaning: 'Cleaning & Estate Care',
  laundry: 'Laundry Pickup & Delivery',
  mealprep: 'Meal Prep',
  nanny: 'Nanny & Childcare',
  eldercare: 'Elder & Companion Care',
  commercial: 'Commercial Cleaning',
  special: 'Special Project / Event',
}

function isSlotDisabled(slot: string, selectedDate: string, serviceId: string): boolean {
  if (!selectedDate) return false
  if (!ADVANCE_NOTICE_IDS.has(serviceId)) return false
  
  const now = new Date()
  const todayET = now.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  if (selectedDate !== todayET) return false
  
  const [timePart, ampm] = slot.split(' ')
  let slotHour = parseInt(timePart.split(':')[0])
  if (ampm === 'PM' && slotHour !== 12) slotHour += 12
  if (ampm === 'AM' && slotHour === 12) slotHour = 0
  
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(now)
  
  const etHour = parseInt(parts.find(p => p.type === 'hour')!.value)
  const etMinute = parseInt(parts.find(p => p.type === 'minute')!.value)
  
  return slotHour * 60 < etHour * 60 + etMinute + 180
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function summarizeSelections(category: Category, sel: Record<string, any>): string[] {
  const lines: string[] = []
  
  if (category === 'cleaning') {
    if (sel.serviceType === 'moveinout') {
      lines.push(`Move-In/Move-Out — ${sel.moveSize || '—'}, condition: ${sel.moveCondition || '—'}`)
    } else {
      lines.push(`${sel.serviceType === 'deep' ? 'Deep' : 'Standard'} Cleaning — ${sel.homeSize || '—'}`)
      if (sel.frequency) lines.push(`Frequency: ${sel.frequency}`)
      if (sel.firstTime) lines.push('First-time customer surcharge applies')
    }
    if (sel.pets && sel.pets !== '0') lines.push(`Pets: ${sel.pets}`)
    if (Array.isArray(sel.addOns) && sel.addOns.length > 0) lines.push(`Add-ons: ${sel.addOns.join(', ')}`)
  } else if (category === 'laundry') {
    if (sel.planType === 'recurring') {
      lines.push(`Recurring Plan: ${sel.recurringPlan || '—'}`)
    } else {
      lines.push(`${sel.planType === 'pickupdelivery' ? 'Pickup & Delivery' : 'Drop-Off'} — ${sel.serviceType || '—'}`)
      lines.push(`Loads: ${sel.loads || '—'}`)
      if (sel.express) lines.push('Express service')
    }
  } else if (category === 'mealprep') {
    lines.push(`Plan: ${sel.planTier || '—'}`)
  } else if (category === 'nanny' || category === 'eldercare') {
    if (sel.mode === 'monthly') {
      lines.push(`Monthly Plan: ${sel.tier || '—'}`)
    } else if (sel.mode === 'dayprogram') {
      lines.push(`Adult Day Program: ${sel.tier || '—'}`)
    } else {
      lines.push(`Hourly: ${sel.subtype || '—'} — ${sel.hours || '—'} hrs`)
    }
    if (sel.extraChildren && Number(sel.extraChildren) > 0) lines.push(`Additional children: ${sel.extraChildren}`)
    if (Array.isArray(sel.specialized) && sel.specialized.length > 0) lines.push(`Specialized care: ${sel.specialized.join(', ')}`)
    if (sel.weekend) lines.push('Weekend/Evening rate')
    if (sel.holiday) lines.push('Holiday rate')
  } else if (category === 'commercial' || category === 'special') {
    if (sel.details) lines.push(`Details: ${sel.details}`)
  }
  
  return lines
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface Service {
  id: string
  title: string
  price_from: string
}

interface MergedFormProps {
  services: Service[]
  initial?: { name: string; email: string; phone: string; serviceId: string }
}

export default function MergedQuoteBookingForm({ services, initial }: MergedFormProps) {
  const _etToday = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const _etDow = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' }).format(new Date())
  const _defaultDate = _etDow === 'Sun'
    ? new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
    : _etToday

  const initialService = initial?.serviceId ? services.find(s => s.id === initial.serviceId) : undefined

  // Quote state
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<Category>('')
  const [sel, setSel] = useState<Record<string, any>>({})
  const [contact, setContact] = useState({ name: initial?.name || '', email: initial?.email || '', phone: initial?.phone || '' })
  const [honeypot, setHoneypot] = useState('')
  const [showBundleModal, setShowBundleModal] = useState(false)

  // Booking state
  const [bookingForm, setBookingForm] = useState({
    customer_name: initial?.name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: '',
    state: '',
    appointment_date: _defaultDate,
    time_slot: '',
    notes: '',
  })
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)

  // Status
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [quoteStep, setQuoteStep] = useState<'quote' | 'booking' | null>(null)

  // Results
  const [result, setResult] = useState<{ subtotal: number | null; tax: number | null; total: number | null; deposit: number | null; breakdown: LineItem[]; bookLink: string }>({
    subtotal: null, tax: null, total: null, deposit: null, breakdown: [], bookLink: '',
  })

  const minDate = _defaultDate
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  function set(field: string, value: unknown) {
    setSel(s => ({ ...s, [field]: value }))
  }

  function setBooking(field: string, value: string) {
    setBookingForm(f => ({ ...f, [field]: value }))
  }

  function toggleAddon(val: string) {
    setSel(s => {
      const current: string[] = s.addOns || []
      return { ...s, addOns: current.includes(val) ? current.filter(x => x !== val) : [...current, val] }
    })
  }

  const handleBundleSelect = (bundleId: string) => {
    const selectedBundle = BUNDLES.find(b => b.id === bundleId)
    if (selectedBundle) {
      setSel({
        bundleId: bundleId,
        bundleName: selectedBundle.name,
        bundlePrice: selectedBundle.price,
        bundleServices: selectedBundle.services.map(s => s.name),
      })
      setCategory('')
      setShowBundleModal(false)
      setStep(3)
    }
  }

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contact, category, selections: sel, honeypot }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')

      const fallbackLink = `/book?name=${encodeURIComponent(contact.name)}&email=${encodeURIComponent(contact.email)}&phone=${encodeURIComponent(contact.phone)}&service=${SERVICE_MAP[category] || ''}`
      
      setResult({
        subtotal: data.subtotal ?? null,
        tax: data.tax ?? null,
        total: data.total ?? null,
        deposit: data.deposit ?? null,
        breakdown: data.breakdown ?? [],
        bookLink: data.bookLink || fallbackLink,
      })
      
      setQuoteStep('quote')
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    if (new Date(bookingForm.appointment_date + 'T12:00:00').getDay() === 0) {
      setErrorMsg('We are closed on Sundays. Please select a Monday–Saturday date.')
      setStatus('idle')
      return
    }

    try {
      let invoice_base64: string | null = null
      let invoice_filename: string | null = null
      let invoice_type: string | null = null

      if (invoiceFile) {
        invoice_base64 = await fileToBase64(invoiceFile)
        invoice_filename = invoiceFile.name
        invoice_type = invoiceFile.type
      }

      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookingForm, invoice_base64, invoice_filename, invoice_type }),
      })

      const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : {}
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const inputClass = "w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white"
  const labelClass = "block text-xs uppercase tracking-widest text-gray-500 mb-2"
  const btnClass = "bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
  const backBtnClass = "border-2 border-gray-200 text-gray-600 px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red transition-colors"

  function ProgressBar({ current }: { current: number }) {
    return (
      <div className="flex items-center gap-2 mb-10 max-w-2xl">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1
          const active = n <= current
          return (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${active ? 'bg-chm-red text-white' : 'bg-gray-100 text-gray-400'}`}>
                {n}
              </div>
              <span className={`text-xs uppercase tracking-widest hidden sm:inline ${active ? 'text-chm-black font-semibold' : 'text-gray-400'}`}>{label}</span>
              {i < STEP_LABELS.length - 1 && <div className={`h-px flex-1 ${n < current ? 'bg-chm-red' : 'bg-gray-200'}`} />}
            </div>
          )
        })}
      </div>
    )
  }

  // ===== QUOTE SUCCESS SCREEN =====
  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        <p className="font-serif text-2xl text-chm-black mb-3">Thanks, {bookingForm.customer_name.split(' ')[0]}!</p>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          Your booking has been received and is pending review. You&apos;ll receive a confirmation email within 1 hour during business hours.
        </p>
        <Link href="/" className="text-chm-red text-xs font-semibold uppercase tracking-widest hover:underline underline-offset-4">
          ← Back to Home
        </Link>
      </div>
    )
  }

  // ===== QUOTE PREVIEW SCREEN (After step 4) =====
  if (quoteStep === 'quote') {
    const isBundle = sel.bundleId
    const lines = isBundle ? [] : summarizeSelections(category, sel)

    return (
      <div className="text-center py-12">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        <p className="font-serif text-2xl text-chm-black mb-3">Your Estimate</p>

        {result.total != null ? (
          <div className="max-w-md mx-auto text-left border border-gray-200 p-6 mt-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">What you selected</p>
            <p className="font-semibold text-chm-black mb-4">
              {isBundle ? sel.bundleName : CATEGORY_TITLES[category] || 'Your Request'}
            </p>

            {!isBundle && lines.length > 0 && (
              <ul className="space-y-1 mb-6 text-sm text-gray-600">
                {lines.map((l, i) => <li key={i}>• {l}</li>)}
              </ul>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Price Breakdown</p>
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{item.label}</span>
                  <span className={item.amount < 0 ? 'text-green-600' : ''}>
                    {item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
                <span>Subtotal</span><span>${result.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>Tax (6%)</span><span>${result.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-chm-black border-t border-gray-200 pt-3">
                <span>Estimated Total</span><span className="text-chm-red">${result.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-cream mt-6 p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Secure Your Spot</p>
              <p className="text-2xl font-serif text-chm-black mb-1">${result.deposit?.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mb-4">30% deposit due to book</p>
              <button type="button" onClick={() => window.open(CLOVER_LINK, '_blank')} className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
                Pay Deposit via Clover
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Enter <strong>${result.deposit?.toFixed(2)}</strong> on the Clover page.
              </p>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
              <button
                type="button"
                onClick={() => setQuoteStep('booking')}
                className="w-full bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Book Now with This Quote →
              </button>
              <button
                type="button"
                onClick={() => { setQuoteStep(null); setStep(1); setCategory(''); setSel({}); }}
                className="w-full border-2 border-gray-200 text-gray-600 px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red transition-colors"
              >
                Back to Quote
              </button>
              <p className="text-xs text-gray-400">This is an estimate. Final pricing confirmed after assessment. Copy sent to email.</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Since this service is customized, our team will follow up with a personalized quote shortly.
          </p>
        )}
      </div>
    )
  }

  // ===== BOOKING DETAILS STEP (After quote preview) =====
  if (quoteStep === 'booking') {
    return (
      <div className="max-w-3xl">
        <ProgressBar current={5} />

        <form onSubmit={handleBookingSubmit} className="space-y-10">
          {/* Personal info */}
          <fieldset className="space-y-5">
            <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">
              Booking Details
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  required
                  type="text"
                  value={bookingForm.customer_name}
                  onChange={e => setBooking('customer_name', e.target.value)}
                  className={inputClass}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <input
                  required
                  type="tel"
                  value={bookingForm.phone}
                  onChange={e => setBooking('phone', e.target.value)}
                  className={inputClass}
                  placeholder="202-555-0100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  required
                  value={bookingForm.email}
                  onChange={e => setBooking('email', e.target.value)}
                  className={inputClass}
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className={labelClass}>State / Location *</label>
                <select
                  required
                  value={bookingForm.state}
                  onChange={e => setBooking('state', e.target.value)}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">Select state…</option>
                  {SERVICE_STATES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Full Address *</label>
              <input
                required
                type="text"
                value={bookingForm.address}
                onChange={e => setBooking('address', e.target.value)}
                className={inputClass}
                placeholder="123 Main St, Apt 4B, Silver Spring, MD 20901"
              />
            </div>
          </fieldset>

          <div className="h-px bg-gray-100" />

          {/* Calendar & Time */}
          <fieldset className="space-y-5">
            <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">
              Schedule
            </legend>
            <div>
              <label className={labelClass}>
                Preferred Date * <span className="text-gray-400 normal-case tracking-normal">(Mon–Sat only)</span>
              </label>
              <BookingCalendar
                value={bookingForm.appointment_date}
                onChange={val => {
                  setErrorMsg('')
                  setBooking('appointment_date', val)
                  if (bookingForm.time_slot && isSlotDisabled(bookingForm.time_slot, val, SERVICE_MAP[category] || '')) {
                    setBooking('time_slot', '')
                  }
                }}
                min={minDate}
                max={maxDate}
                onSundayAttempt={() => setErrorMsg('We are closed on Sundays — please pick a Monday–Saturday date.')}
              />
              <input required type="text" value={bookingForm.appointment_date} readOnly tabIndex={-1} className="sr-only" aria-hidden="true" />
            </div>
            <div>
              <label className={labelClass}>Preferred Time *</label>
              <select
                required
                value={bookingForm.time_slot}
                onChange={e => setBooking('time_slot', e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Select a time…</option>
                {TIME_SLOTS.filter(t => !isSlotDisabled(t, bookingForm.appointment_date, SERVICE_MAP[category] || '')).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </fieldset>

          <div className="h-px bg-gray-100" />

          {/* Notes */}
          <fieldset className="space-y-5">
            <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">
              Additional Information
            </legend>
            <textarea
              rows={4}
              value={bookingForm.notes}
              onChange={e => setBooking('notes', e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Special requirements, frequency of service, building access details, etc."
            />
            <div>
              <label className={labelClass}>
                Invoice Screenshot <span className="text-gray-400 normal-case tracking-normal">(optional — if you already paid deposit)</span>
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={e => setInvoiceFile(e.target.files?.[0] || null)}
                className={`${inputClass} file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:uppercase file:tracking-widest file:font-semibold file:bg-gray-100 file:text-chm-black`}
              />
            </div>
          </fieldset>

          {(status === 'error' || errorMsg) && (
            <p className="text-chm-red text-sm">{errorMsg}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setQuoteStep('quote')}
              className={backBtnClass}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className={btnClass}
            >
              {status === 'submitting' ? 'Submitting…' : 'Complete Booking'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ===== QUOTE STEPS 1-4 (Main flow) =====

  // STEP 1: SERVICE SELECTION
  if (step === 1) {
    const options: { id: Category; title: string; desc: string }[] = [
      { id: 'cleaning', title: 'Cleaning & Estate Care', desc: 'Standard, deep, or move-in/move-out cleaning' },
      { id: 'laundry', title: 'Laundry Pickup & Delivery', desc: 'Drop-off, pickup & delivery, or recurring plans' },
      { id: 'mealprep', title: 'Meal Prep', desc: 'Weekly meal preparation plans' },
      { id: 'nanny', title: 'Nanny & Childcare', desc: 'Full-time, hourly, or specialized childcare' },
      { id: 'eldercare', title: 'Elder & Companion Care', desc: 'Companion care, hourly support, or day programs' },
      { id: 'commercial', title: 'Commercial Cleaning', desc: "We'll send you a custom quote" },
      { id: 'special', title: 'Special Project / Event', desc: "We'll send you a custom quote" },
    ]

    return (
      <>
        <div className="max-w-4xl space-y-12">
          <ProgressBar current={1} />
          <div className="space-y-4">
            <p className={labelClass}>What service are you interested in?</p>

            <button
              type="button"
              onClick={() => setShowBundleModal(true)}
              className="w-full text-left border-2 border-chm-red bg-chm-red/5 hover:bg-chm-red/10 px-6 py-6 transition-colors group rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-chm-black group-hover:text-chm-red transition-colors text-lg">💡 Bundle Deals</p>
                  <p className="text-sm text-gray-600 mt-2">Save up to 22% with our curated packages</p>
                  <p className="text-xs text-gray-400 mt-3">Residential • Family • Senior Care • Commercial</p>
                </div>
                <span className="text-2xl">→</span>
              </div>
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs uppercase tracking-widest text-gray-400">Or choose individual services</span>
              </div>
            </div>

            {options.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => { setCategory(o.id); setSel({}); setStep(2) }}
                className="w-full text-left border border-gray-200 hover:border-chm-red px-6 py-5 transition-colors group rounded"
              >
                <p className="font-semibold text-chm-black group-hover:text-chm-red transition-colors">{o.title}</p>
                <p className="text-xs text-gray-400 mt-1">{o.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {showBundleModal && (
          <BundleModal
            onSelectBundle={handleBundleSelect}
            onClose={() => setShowBundleModal(false)}
          />
        )}
      </>
    )
  }

  // STEP 2: DETAILS - (Reusing QuoteForm logic - simplified here)
  if (step === 2) {
    return (
      <div className="max-w-2xl">
        <ProgressBar current={2} />
        <form onSubmit={e => { e.preventDefault(); setStep(3) }} className="space-y-6">
          {/* Quick simplified details - full logic from QuoteForm would go here */}
          {category === 'cleaning' && (
            <>
              <div>
                <p className={labelClass}>Type of Cleaning *</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { v: 'standard', l: 'Standard Cleaning' },
                    { v: 'deep', l: 'Deep Cleaning' },
                    { v: 'moveinout', l: 'Move-In / Move-Out' },
                  ].map(o => (
                    <label key={o.v} className="flex items-center gap-2 border border-gray-200 px-4 py-3 cursor-pointer text-sm">
                      <input type="radio" required name="serviceType" checked={sel.serviceType === o.v}
                        onChange={() => set('serviceType', o.v)} className="accent-chm-red" />
                      {o.l}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Add more category details as needed */}

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => setStep(1)} className={backBtnClass}>Back</button>
            <button type="submit" className={btnClass}>Continue</button>
          </div>
        </form>
      </div>
    )
  }

  // STEP 3: REVIEW
  if (step === 3) {
    const isBundle = sel.bundleId
    const lines = isBundle ? [] : summarizeSelections(category, sel)

    return (
      <div className="max-w-2xl">
        <ProgressBar current={3} />
        <div className="space-y-6">
          <div className="border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-chm-black">
                {isBundle ? sel.bundleName : CATEGORY_TITLES[category] || 'Your Request'}
              </p>
              <button type="button" onClick={() => setStep(1)} className="text-xs text-chm-red hover:underline uppercase tracking-widest">
                Change
              </button>
            </div>
            {isBundle ? (
              <div className="space-y-4">
                <div className="bg-cream p-4 rounded">
                  <p className="text-sm text-gray-600 mb-3">Bundle includes:</p>
                  <ul className="space-y-1">
                    {BUNDLES.find(b => b.id === sel.bundleId)?.services.map((service, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start">
                        <span className="text-chm-red mr-2">✓</span>
                        <span>{service.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <ul className="space-y-2 text-sm text-gray-600">
                {lines.map((l, i) => <li key={i}>• {l}</li>)}
              </ul>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => setStep(1)} className={backBtnClass}>Back</button>
            <button type="button" onClick={() => setStep(4)} className={btnClass}>Continue</button>
          </div>
        </div>
      </div>
    )
  }

  // STEP 4: CONTACT INFO
  return (
    <div className="max-w-2xl">
      <ProgressBar current={4} />
      <form onSubmit={handleQuoteSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input required type="text" value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} className={inputClass} placeholder="Jane Smith" />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input required type="tel" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: formatPhone(e.target.value) }))} className={inputClass} placeholder="(202) 555-0100" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input required type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} className={inputClass} placeholder="jane@example.com" />
        </div>

        <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        {status === 'error' && <p className="text-chm-red text-sm">{errorMsg}</p>}

        <div className="flex gap-4 pt-2">
          <button type="button" onClick={() => setStep(3)} className={backBtnClass}>Back</button>
          <button type="submit" disabled={status === 'submitting'} className={btnClass}>
            {status === 'submitting' ? 'Calculating…' : 'Get Quote & Book'}
          </button>
        </div>
      </form>
    </div>
  )
}
