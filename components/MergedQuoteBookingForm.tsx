'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BUNDLES } from '@/lib/bundles'
import BundleModal from './BundleModal'

type Category = 'cleaning' | 'laundry' | 'mealprep' | 'nanny' | 'eldercare' | 'commercial' | 'special' | ''
type LineItem = { label: string; amount: number }
type SelectionRecord = Record<string, string | number | boolean | string[] | Record<string, string>>

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

function summarizeSelections(category: Category, sel: SelectionRecord): string[] {
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

interface MergedFormProps {
  initial?: { name: string; email: string; phone: string; serviceId: string }
}

export default function MergedQuoteBookingForm({ initial }: MergedFormProps) {
  const _etToday = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const _etDow = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short' }).format(new Date())
  const _defaultDate = _etDow === 'Sun'
    ? new Date(Date.now() + 86400000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
    : _etToday

  // Quote state
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<Category>('')
  const [sel, setSel] = useState<SelectionRecord>({})
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

  function set(field: string, value: string | number | boolean | string[]) {
    setSel(s => ({ ...s, [field]: value }))
  }

  function setBooking(field: string, value: string) {
    setBookingForm(f => ({ ...f, [field]: value }))
  }

  function toggleAddon(val: string) {
    setSel(s => {
      const current: string[] = (s.addOns as string[]) || []
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
    // For bundles, use bundleId; for regular services, use category
    const isBundle = sel.bundleId !== undefined
    const serviceCategory = isBundle ? `bundle-${sel.bundleId}` : category

    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...contact, category: sel.bundleId ? `bundle-${sel.bundleId}` : category, selections: sel, honeypot }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error ?? 'Submission failed')

    const fallbackLink = `/book?name=${encodeURIComponent(contact.name)}&email=${encodeURIComponent(contact.email)}&phone=${encodeURIComponent(contact.phone)}&service=${SERVICE_MAP[serviceCategory] || ''}`
    
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
    // Validate all required fields
    if (!bookingForm.customer_name?.trim() || !bookingForm.phone?.trim() || !bookingForm.address?.trim() || !bookingForm.state || !bookingForm.appointment_date || !bookingForm.time_slot || !bookingForm.email?.trim()) {
      setErrorMsg('Please fill in all required fields')
      setStatus('idle')
      return
    }
    // Check for Sunday
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
      // For bundles, use bundleId as service_id; for regular services, use serviceId or category
      const isBundle = sel.bundleId !== undefined
      const serviceId = isBundle ? String(sel.bundleId) : (sel.serviceId || category)
      
      const payload = {
        customer_name: bookingForm.customer_name.trim(),
        phone: bookingForm.phone.trim(),
        email: bookingForm.email.trim(),
        address: bookingForm.address.trim(),
        state: bookingForm.state,
        service_id: serviceId,
        appointment_date: bookingForm.appointment_date,
        time_slot: bookingForm.time_slot,
        notes: bookingForm.notes?.trim() || null,
        service_title: String(sel.bundleName || CATEGORY_TITLES[category] || ''),
        invoice_base64,
        invoice_filename,
        invoice_type,
      }
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  // ===== BOOKING SUCCESS SCREEN =====
  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        <p className="font-serif text-2xl text-chm-black mb-3">Booking Received</p>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          Thank you, <strong>{bookingForm.customer_name}</strong>. Your booking has been received and is pending review. You&apos;ll receive a confirmation email within 1 hour (Mon–Sat, 9 AM–9 PM). For urgent inquiries, call 202-579-2944.
        </p>
        <Link href="/" className="text-chm-red text-xs font-semibold uppercase tracking-widest hover:underline underline-offset-4">
          ← Back to Home
        </Link>
      </div>
    )
  }

  // ===== QUOTE PREVIEW SCREEN =====
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
              {isBundle ? String(sel.bundleName) : CATEGORY_TITLES[category] || 'Your Request'}
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
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center border border-gray-200 p-6 mt-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">What you selected</p>
            <p className="font-semibold text-chm-black mb-6">
              {isBundle ? String(sel.bundleName) : CATEGORY_TITLES[category] || 'Your Request'}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Thanks for your interest! Since this service is customized, our team will review your details and follow up with a personalized quote shortly.
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 mt-6 pt-6 space-y-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setQuoteStep('booking')}
            className="w-full bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
          >
            Book Now with This Quote →
          </button>
          <button
            type="button"
            onClick={() => { setQuoteStep(null); setStep(1); setCategory(''); setSel({}) }}
            className="w-full border-2 border-gray-200 text-gray-600 px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red transition-colors"
          >
            Back to Quote
          </button>
          <p className="text-xs text-gray-400">This is an estimate. Final pricing confirmed after assessment.</p>
        </div>
      </div>
    )
  }


        {/* PRICING - only show if available */}
        {result.total != null && (
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
          </div>
        )}

        {/* CUSTOM SERVICE MESSAGE - only show if no pricing */}
        {result.total === null && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-gray-600">Thanks for your interest! Since this service is customized, our team will review your details and follow up with a personalized quote shortly.</p>
          </div>
        )}

        {/* BOOK NOW BUTTON - ALWAYS SHOW */}
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
            onClick={() => { setQuoteStep(null); setStep(1); setCategory(''); setSel({}) }}
            className="w-full border-2 border-gray-200 text-gray-600 px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red transition-colors"
          >
            Back to Quote
          </button>
          <p className="text-xs text-gray-400">This is an estimate. Final pricing confirmed after assessment.</p>
        </div>
      </div>
    </div>
  )
}
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Since this service is customized, our team will follow up with a personalized quote shortly.
          </p>
        )}
      </div>
    )
  }

  // ===== BOOKING DETAILS STEP (FIXED WITH NATIVE DATE INPUT) =====
  if (quoteStep === 'booking') {
    return (
      <div className="max-w-3xl">
        <ProgressBar current={5} />

        <form onSubmit={handleBookingSubmit} className="space-y-10">
          <fieldset className="space-y-5">
            <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">
              Your Information
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
                  onChange={e => setBooking('phone', formatPhone(e.target.value))}
                  className={inputClass}
                  placeholder="(202) 555-0100"
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

          <fieldset className="space-y-5">
            <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">
              Service & Schedule
            </legend>
            <div>
              <label className={labelClass}>
                Preferred Date * <span className="text-gray-400 normal-case tracking-normal">(Mon–Sat only)</span>
              </label>
              <input
                required
                type="date"
                value={bookingForm.appointment_date}
                onChange={e => {
                  setErrorMsg('')
                  setBooking('appointment_date', e.target.value)
                  if (bookingForm.time_slot && isSlotDisabled(bookingForm.time_slot, e.target.value, SERVICE_MAP[category] || '')) {
                    setBooking('time_slot', '')
                  }
                }}
                min={minDate}
                max={maxDate}
                className={inputClass}
              />
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

          <fieldset className="space-y-5">
            <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">
              Additional Notes
            </legend>
            <textarea
              rows={4}
              value={bookingForm.notes}
              onChange={e => setBooking('notes', e.target.value)}
              className={`${inputClass} resize-none`}
              placeholder="Address, special requirements, frequency of service…"
            />
            <div>
              <label className={labelClass}>
                Invoice Screenshot <span className="text-gray-400 normal-case tracking-normal">(optional — if you already paid a deposit)</span>
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
              {status === 'submitting' ? 'Submitting…' : 'Request Booking'}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Mon–Sat 9 AM–9 PM &nbsp;·&nbsp; Closed Sundays &nbsp;·&nbsp; 202-579-2944
          </p>
        </form>
      </div>
    )
  }

  // ===== STEP 1: SERVICE SELECTION =====
  if (step === 1) {
    const options: { id: Category; title: string; desc: string }[] = [
      { id: 'cleaning', title: 'Cleaning & Estate Care', desc: 'Standard, deep, or move-in/move-out cleaning' },
      { id: 'laundry', title: 'Laundry Pickup & Delivery', desc: 'Drop-off, pickup & delivery, or recurring plans' },
      { id: 'mealprep', title: 'Meal Prep', desc: 'Weekly meal preparation plans' },
      { id: 'nanny', title: 'Nanny & Childcare', desc: 'Full-time, hourly, or specialized childcare' },
      { id: 'eldercare', title: 'Elder & Companion Care', desc: 'Companion care, hourly support, or day programs' },
      { id: 'commercial', title: 'Commercial Cleaning', desc: 'We\'ll send you a custom quote' },
      { id: 'special', title: 'Special Project / Event', desc: 'We\'ll send you a custom quote' },
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

  // ===== STEP 2: DETAILS (FULL - ALL CATEGORIES) =====
  if (step === 2) {
    return (
      <div className="max-w-2xl">
        <ProgressBar current={2} />
        <form onSubmit={e => { e.preventDefault(); setStep(3) }} className="space-y-6">
          {/* CLEANING */}
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
              {(sel.serviceType === 'standard' || sel.serviceType === 'deep') && (
                <>
                  <div>
                    <label className={labelClass}>Home Size *</label>
                    <select required value={String(sel.homeSize || '')} onChange={e => set('homeSize', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="studio">Studio</option>
                      <option value="1br">1 Bedroom</option>
                      <option value="2br">2 Bedroom</option>
                      <option value="3br">3 Bedroom</option>
                      <option value="4br">4 Bedroom</option>
                      <option value="5br+">5+ Bedroom</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>How Often? *</label>
                    <select required value={String(sel.frequency || '')} onChange={e => set('frequency', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="onetime">One-Time Only</option>
                      <option value="monthly">Monthly</option>
                      <option value="biweekly">Bi-Weekly</option>
                      <option value="weekly">Weekly</option>
                      <option value="twiceweekly">Twice Per Week</option>
                    </select>
                  </div>
                  {sel.serviceType === 'standard' && (
                    <label className="flex items-center gap-3 text-sm">
                      <input type="checkbox" checked={!!sel.firstTime} onChange={e => set('firstTime', e.target.checked)} className="w-4 h-4 accent-chm-red" />
                      This is my first time using Convenience Hub
                    </label>
                  )}
                </>
              )}
              {sel.serviceType === 'moveinout' && (
                <>
                  <div>
                    <label className={labelClass}>Property Size *</label>
                    <select required value={String(sel.moveSize || '')} onChange={e => set('moveSize', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="1br">1 Bedroom Apartment</option>
                      <option value="3br">3 Bedroom House</option>
                      <option value="4br">4 Bedroom House</option>
                      <option value="5br">5 Bedroom House</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Current Condition *</label>
                    <select required value={String(sel.moveCondition || '')} onChange={e => set('moveCondition', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="good">Good (regular upkeep)</option>
                      <option value="poor">Poor (needs deep clean)</option>
                    </select>
                  </div>
                </>
              )}
              {sel.serviceType && (
                <>
                  <div>
                    <label className={labelClass}>Pets in the Home</label>
                    <select value={String(sel.pets || '0')} onChange={e => set('pets', e.target.value)} className={inputClass}>
                      <option value="0">No pets</option>
                      <option value="1">1 Pet</option>
                      <option value="2">2 Pets</option>
                      <option value="3+">3+ Pets</option>
                    </select>
                  </div>
                  <div>
                    <p className={labelClass}>Add-On Services (optional)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { v: 'carpet', l: 'Carpet Shampoo & Steam Clean' },
                        { v: 'windowInt', l: 'Window Cleaning (Interior)' },
                        { v: 'windowExt', l: 'Window Cleaning (Int + Ext)' },
                        { v: 'appliance', l: 'Appliance Deep Clean' },
                        { v: 'grout', l: 'Grout & Tile Scrubbing' },
                        { v: 'petOdor', l: 'Pet Odor Elimination' },
                        { v: 'disinfect', l: 'Disinfection Upgrade' },
                      ].map(a => (
                        <label key={a.v} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={(sel.addOns as string[] || []).includes(a.v)} onChange={() => toggleAddon(a.v)} className="w-4 h-4 accent-chm-red" />
                          {a.l}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* LAUNDRY */}
          {category === 'laundry' && (
            <>
              <div>
                <p className={labelClass}>Plan Type *</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { v: 'standard', l: 'Standard Service (Per Pound)' },
                    { v: 'foldingOnly', l: 'Folding Only (Pre-Washed)' },
                    { v: 'recurring', l: 'Monthly Subscription' },
                  ].map(o => (
                    <label key={o.v} className="flex items-center gap-2 border border-gray-200 px-4 py-3 cursor-pointer text-sm">
                      <input type="radio" required name="planType" checked={sel.planType === o.v}
                        onChange={() => set('planType', o.v)} className="accent-chm-red" />
                      {o.l}
                    </label>
                  ))}
                </div>
              </div>
              {sel.planType === 'standard' && (
                <>
                  <div>
                    <label className={labelClass}>Fabric Category *</label>
                    <select required value={String(sel.category || '')} onChange={e => set('category', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="colors">Colors — $3.99/lb</option>
                      <option value="mixed">Mixed Load — $4.99/lb</option>
                      <option value="bedding">Bedding & Linens — $4.99/lb</option>
                      <option value="whites">Whites — $6.99/lb</option>
                      <option value="wool">Wool & Sweaters — $7.99/lb</option>
                      <option value="delicates">Delicates — $8.99/lb</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Approximate Weight (lbs) * <span className="text-gray-400 normal-case">— 10 lb minimum</span></label>
                    <input required type="number" min={10} value={String(sel.weight || '')} onChange={e => set('weight', e.target.value)} className={inputClass} placeholder="e.g. 20" />
                  </div>
                  <div>
                    <label className={labelClass}>Premium Add-On</label>
                    <select value={String(sel.premiumOption || 'none')} onChange={e => set('premiumOption', e.target.value)} className={inputClass}>
                      <option value="none">None</option>
                      <option value="ironhang">Iron & Hang (+$2.00/lb)</option>
                      <option value="expressiron">Express Iron & Press (+$4.00/lb, 2–3 day)</option>
                      <option value="samedayexpress">Same-Day Express (+$1.75/lb)</option>
                    </select>
                  </div>
                </>
              )}
              {sel.planType === 'foldingOnly' && (
                <div>
                  <label className={labelClass}>Approximate Weight (lbs) * <span className="text-gray-400 normal-case">— 10 lb minimum</span></label>
                  <input required type="number" min={10} value={String(sel.weight || '')} onChange={e => set('weight', e.target.value)} className={inputClass} placeholder="e.g. 15" />
                </div>
              )}
              {sel.planType === 'recurring' && (
                <div>
                  <label className={labelClass}>Choose a Plan *</label>
                  <select required value={String(sel.recurringPlan || '')} onChange={e => set('recurringPlan', e.target.value)} className={inputClass}>
                    <option value="">Select…</option>
                    <option value="light">Light Load — up to 40 lbs/mo ($140)</option>
                    <option value="standard">Standard Load — up to 80 lbs/mo ($250)</option>
                    <option value="premium">Premium Load — up to 120 lbs/mo ($350)</option>
                    <option value="unlimited">Unlimited Load — no limit ($500)</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* MEAL PREP */}
          {category === 'mealprep' && (
            <>
              <div>
                <p className={labelClass}>How would you like to be billed? *</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { v: 'monthly', l: 'Monthly Meal Prep Plan' },
                    { v: 'hourly', l: 'Hourly Culinary Service' },
                    { v: 'specialty', l: 'Specialty Meals (Per Serving)' },
                    { v: 'grocery', l: 'Grocery Shopping Service' },
                  ].map(o => (
                    <label key={o.v} className="flex items-center gap-2 border border-gray-200 px-4 py-3 cursor-pointer text-sm">
                      <input type="radio" required name="mode" checked={sel.mode === o.v}
                        onChange={() => set('mode', o.v)} className="accent-chm-red" />
                      {o.l}
                    </label>
                  ))}
                </div>
              </div>
              {sel.mode === 'monthly' && (
                <div>
                  <label className={labelClass}>Choose a Plan *</label>
                  <select required value={String(sel.planTier || '')} onChange={e => set('planTier', e.target.value)} className={inputClass}>
                    <option value="">Select…</option>
                    <option value="starter">Starter — 10 servings/week (~$350/mo)</option>
                    <option value="standard">Standard — 20 servings/week (~$675/mo)</option>
                    <option value="premium">Premium — 30 servings/week (~$975/mo)</option>
                    <option value="luxury">Luxury — 40+ servings/week (~$1,350/mo)</option>
                  </select>
                </div>
              )}
              {sel.mode === 'hourly' && (
                <>
                  <div>
                    <label className={labelClass}>Service Type *</label>
                    <select required value={String(sel.subtype || '')} onChange={e => set('subtype', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="personalchef">Personal Chef / Meal Prep — $90/hr</option>
                      <option value="eventcatering">Special Event Catering Prep — $87.50/hr</option>
                      <option value="kitchencoaching">Kitchen Coaching & Training — $105/hr</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Number of Hours *</label>
                    <input required type="number" min={2} value={String(sel.hours || '')} onChange={e => set('hours', e.target.value)} className={inputClass} placeholder="e.g. 3" />
                  </div>
                </>
              )}
              {sel.mode === 'specialty' && (
                <div>
                  <p className={labelClass}>Servings Needed</p>
                  <div className="space-y-2">
                    {[
                      { key: 'breakfast', label: 'Breakfast Prep', price: '$10/serving' },
                      { key: 'lunch', label: 'Lunch Pack', price: '$12.50/serving' },
                      { key: 'dinner', label: 'Dinner Entrée', price: '$16/serving' },
                      { key: 'dessert', label: 'Dessert/Baked Goods', price: '$9/serving' },
                    ].map(a => (
                      <div key={a.key} className="flex items-center justify-between gap-3 border border-gray-100 px-4 py-2">
                        <span className="text-sm text-gray-700">{a.label} <span className="text-gray-400 text-xs">({a.price})</span></span>
                        <input
                          type="number"
                          min={0}
                          value={((sel.specialtyQty as Record<string, string>) || {})[a.key] || ''}
                          onChange={e => {
                            const qty = e.target.value
                            setSel(s => ({ ...s, specialtyQty: { ...(s.specialtyQty as Record<string, string> || {}), [a.key]: qty } }))
                          }}
                          className="w-16 border border-gray-200 px-2 py-1 text-sm text-center"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {sel.mode === 'grocery' && (
                <>
                  <div>
                    <label className={labelClass}>Service Type *</label>
                    <select required value={String(sel.grocerySubtype || '')} onChange={e => set('grocerySubtype', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="basic">Basic Grocery Shopping — $40/visit</option>
                      <option value="premium">Premium Sourcing (Specialty/Organic) — $62.50/visit</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Number of Visits *</label>
                    <input required type="number" min={1} value={String(sel.groceryVisits || '')} onChange={e => set('groceryVisits', e.target.value)} className={inputClass} placeholder="e.g. 4" />
                  </div>
                  <p className="text-xs text-gray-400">Mileage and receipt reimbursement calculated separately at time of service.</p>
                </>
              )}
            </>
          )}

          {/* NANNY & ELDER CARE */}
          {(category === 'nanny' || category === 'eldercare') && (
            <>
              <div>
                <p className={labelClass}>How would you like to be billed? *</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { v: 'monthly', l: 'Monthly Plan' },
                    { v: 'hourly', l: 'Hourly Service' },
                    ...(category === 'eldercare' ? [{ v: 'dayprogram', l: 'Adult Day Program' }] : []),
                  ].map(o => (
                    <label key={o.v} className="flex items-center gap-2 border border-gray-200 px-4 py-3 cursor-pointer text-sm">
                      <input type="radio" required name="mode" checked={sel.mode === o.v}
                        onChange={() => set('mode', o.v)} className="accent-chm-red" />
                      {o.l}
                    </label>
                  ))}
                </div>
              </div>
              {sel.mode === 'monthly' && category === 'nanny' && (
                <div>
                  <label className={labelClass}>Nanny Tier *</label>
                  <select required value={String(sel.tier || '')} onChange={e => set('tier', e.target.value)} className={inputClass}>
                    <option value="">Select…</option>
                    <option value="parttime">Part-Time — 15-20 hrs/week (~$2,400-3,200/mo)</option>
                    <option value="standard">Standard — 30-35 hrs/week (~$4,800-6,300/mo)</option>
                    <option value="premium">Premium — 40+ hrs/week (~$7,200-10,000/mo)</option>
                  </select>
                </div>
              )}
              {sel.mode === 'monthly' && category === 'eldercare' && (
                <div>
                  <label className={labelClass}>Companion Care Tier *</label>
                  <select required value={String(sel.tier || '')} onChange={e => set('tier', e.target.value)} className={inputClass}>
                    <option value="">Select…</option>
                    <option value="light">Light — 8-10 hrs/week (~$800-1,000/mo)</option>
                    <option value="standard">Standard — 20-25 hrs/week (~$2,000-2,750/mo)</option>
                    <option value="fulltime">Full-Time — 40+ hrs/week (~$4,000-6,000/mo)</option>
                    <option value="24hour">24-Hour Care (~$8,000-12,000/mo)</option>
                  </select>
                </div>
              )}
              {sel.mode === 'dayprogram' && category === 'eldercare' && (
                <div>
                  <label className={labelClass}>Program Type *</label>
                  <select required value={String(sel.tier || '')} onChange={e => set('tier', e.target.value)} className={inputClass}>
                    <option value="">Select…</option>
                    <option value="social">Social Activities — ~$60-80/day</option>
                    <option value="wellness">Wellness & Activity — ~$80-120/day</option>
                    <option value="fullservice">Full-Service — ~$120-150/day</option>
                  </select>
                </div>
              )}
              {sel.mode === 'hourly' && category === 'nanny' && (
                <>
                  <div>
                    <label className={labelClass}>Service Type *</label>
                    <select required value={String(sel.subtype || '')} onChange={e => set('subtype', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="babysitting">Standard Babysitting — $35-45/hr</option>
                      <option value="overnight">Overnight Care — $30-40/hr</option>
                      <option value="nannyhousekeeping">Nanny Plus Housekeeping — $35-45/hr</option>
                      <option value="event">Event/Party Supervision — $30-40/hr</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Number of Hours *</label>
                    <input required type="number" min={2} value={String(sel.hours || '')} onChange={e => set('hours', e.target.value)} className={inputClass} placeholder="e.g. 4" />
                  </div>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={!!sel.weekend} onChange={e => set('weekend', e.target.checked)} className="w-4 h-4 accent-chm-red" />
                    Weekend / Evening Rate (+$4/hr)
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <input type="checkbox" checked={!!sel.holiday} onChange={e => set('holiday', e.target.checked)} className="w-4 h-4 accent-chm-red" />
                    Holiday Rate (+37.5%)
                  </label>
                </>
              )}
              {sel.mode === 'hourly' && category === 'eldercare' && (
                <>
                  <div>
                    <label className={labelClass}>Service Type *</label>
                    <select required value={String(sel.subtype || '')} onChange={e => set('subtype', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="companion">Care Companion — $30-40/hr</option>
                      <option value="personalcare">Personal Care Assistant — $30-40/hr</option>
                      <option value="postrecovery">Post-Recovery Care — $30-40/hr</option>
                      <option value="respite">Respite Care — $30-40/hr</option>
                      <option value="overnight">Overnight Care — $30-40/hr</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Number of Hours *</label>
                    <input required type="number" min={2} value={String(sel.hours || '')} onChange={e => set('hours', e.target.value)} className={inputClass} placeholder="e.g. 4" />
                  </div>
                </>
              )}
            </>
          )}

          {/* COMMERCIAL & SPECIAL */}
          {(category === 'commercial' || category === 'special') && (
            <div>
              <label className={labelClass}>Tell us more about what you need *</label>
              <textarea required rows={5} value={String(sel.details || '')} onChange={e => set('details', e.target.value)} className={inputClass}
                placeholder={category === 'commercial'
                  ? "Property size (sq ft), office type, cleaning frequency needed, any specialized requirements (medical, restaurant, gym, etc.)"
                  : "Project type, timeline, event date, scope of work, special requirements, etc."} />
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => setStep(1)} className={backBtnClass}>Back</button>
            <button type="submit" className={btnClass}>Continue</button>
          </div>
        </form>
      </div>
    )
  }

  // ===== STEP 3: REVIEW =====
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
                {isBundle ? String(sel.bundleName) : CATEGORY_TITLES[category] || 'Your Request'}
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

          <p className="text-xs text-gray-400">
            Everything look right? Continue to get your {isBundle ? 'bundle quote' : (category === 'commercial' || category === 'special') ? 'custom quote request' : 'instant estimate'}.
          </p>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => setStep(1)} className={backBtnClass}>Back</button>
            <button type="button" onClick={() => setStep(4)} className={btnClass}>Looks Good, Continue</button>
          </div>
        </div>
      </div>
    )
  }

  // ===== STEP 4: CONTACT INFO =====
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
