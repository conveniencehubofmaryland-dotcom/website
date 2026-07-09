/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

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
const STEP_LABELS = ['Service', 'Details', 'Review', 'Contact']

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const CATEGORY_TITLES: Record<string, string> = {
  cleaning: 'Cleaning & Estate Care',
  laundry: 'Laundry Pickup & Delivery',
  mealprep: 'Meal Prep',
  nanny: 'Nanny & Childcare',
  eldercare: 'Elder & Companion Care',
  commercial: 'Commercial Cleaning',
  special: 'Special Project / Event',
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

export default function QuoteForm() {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<Category>('')
  const [sel, setSel] = useState<Record<string, any>>({})
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')
  const [result, setResult] = useState<{ subtotal: number | null; tax: number | null; total: number | null; deposit: number | null; breakdown: LineItem[]; bookLink: string }>({
    subtotal: null, tax: null, total: null, deposit: null, breakdown: [], bookLink: '',
  })
  function set(field: string, value: unknown) {
    setSel(s => ({ ...s, [field]: value }))
  }

  function toggleAddon(val: string) {
    setSel(s => {
      const current: string[] = s.addOns || []
      return { ...s, addOns: current.includes(val) ? current.filter(x => x !== val) : [...current, val] }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrMsg('')
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
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
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

  // ---------- SUCCESS SCREEN ----------
  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        <p className="font-serif text-2xl text-chm-black mb-3">Thanks, {contact.name.split(' ')[0]}!</p>

        {result.total != null ? (
          <div className="max-w-md mx-auto text-left border border-gray-200 p-6 mt-6">
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
                On the Clover page, enter <strong>${result.deposit?.toFixed(2)}</strong> as your payment amount.
              </p>
              <div className="border-t border-gray-200 mt-5 pt-5">
                <p className="text-xs text-gray-500 mb-3">Already paid? Click below to complete your booking with full details.</p>
                <a href={result.bookLink} className="inline-block border-2 border-chm-red text-chm-red px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-chm-red hover:text-white transition-colors">
                  Book Now →
                </a>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4">This is an estimate. Final pricing confirmed after a brief assessment. We&apos;ve emailed a copy to you.</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Since this service is customized, our team will review your details and follow up with a personalized quote shortly.
          </p>
        )}
      </div>
    )
  }

  // ---------- STEP 1: CATEGORY ----------
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
      <div className="max-w-2xl">
        <ProgressBar current={1} />
        <div className="space-y-4">
          <p className={labelClass}>What service are you interested in?</p>
          {options.map(o => (
            <button
              key={o.id}
              type="button"
              onClick={() => { setCategory(o.id); setSel({}); setStep(2) }}
              className="w-full text-left border border-gray-200 hover:border-chm-red px-6 py-5 transition-colors group"
            >
              <p className="font-semibold text-chm-black group-hover:text-chm-red transition-colors">{o.title}</p>
              <p className="text-xs text-gray-400 mt-1">{o.desc}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---------- STEP 2: SERVICE DETAILS ----------
  if (step === 2) {
    return (
      <div className="max-w-2xl">
        <ProgressBar current={2} />
        <form onSubmit={e => { e.preventDefault(); setStep(3) }} className="space-y-6">

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
                    <select required value={sel.homeSize || ''} onChange={e => set('homeSize', e.target.value)} className={inputClass}>
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
                    <select required value={sel.frequency || ''} onChange={e => set('frequency', e.target.value)} className={inputClass}>
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
                    <select required value={sel.moveSize || ''} onChange={e => set('moveSize', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="1br">1 Bedroom Apartment</option>
                      <option value="3br">3 Bedroom House</option>
                      <option value="4br">4 Bedroom House</option>
                      <option value="5br">5 Bedroom House</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Current Condition *</label>
                    <select required value={sel.moveCondition || ''} onChange={e => set('moveCondition', e.target.value)} className={inputClass}>
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
                    <select value={sel.pets || '0'} onChange={e => set('pets', e.target.value)} className={inputClass}>
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
                          <input type="checkbox" checked={(sel.addOns || []).includes(a.v)} onChange={() => toggleAddon(a.v)} className="w-4 h-4 accent-chm-red" />
                          {a.l}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

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
                    <select required value={sel.category || ''} onChange={e => set('category', e.target.value)} className={inputClass}>
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
                    <input required type="number" min={10} value={sel.weight || ''} onChange={e => set('weight', e.target.value)} className={inputClass} placeholder="e.g. 20" />
                  </div>
                  <div>
                    <label className={labelClass}>Premium Add-On</label>
                    <select value={sel.premiumOption || 'none'} onChange={e => set('premiumOption', e.target.value)} className={inputClass}>
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
                  <input required type="number" min={10} value={sel.weight || ''} onChange={e => set('weight', e.target.value)} className={inputClass} placeholder="e.g. 15" />
                </div>
              )}

              {sel.planType === 'recurring' && (
                <div>
                  <label className={labelClass}>Choose a Plan *</label>
                  <select required value={sel.recurringPlan || ''} onChange={e => set('recurringPlan', e.target.value)} className={inputClass}>
                    <option value="">Select…</option>
                    <option value="light">Light Load — up to 40 lbs/mo ($140)</option>
                    <option value="standard">Standard Load — up to 80 lbs/mo ($250)</option>
                    <option value="premium">Premium Load — up to 120 lbs/mo ($350)</option>
                    <option value="unlimited">Unlimited Load — no limit ($500)</option>
                  </select>
                </div>
              )}

              {sel.planType && (
                <div>
                  <p className={labelClass}>Specialty Add-Ons (optional)</p>
                  <div className="space-y-2">
                    {[
                      { key: 'stainRemoval', label: 'Stain Removal Treatment', price: '$15/item' },
                      { key: 'allergenFree', label: 'Allergen-Free Wash Cycle', price: '+$15/load' },
                      { key: 'hypoallergenic', label: 'Hypoallergenic Detergent', price: '+$10/load' },
                      { key: 'comforter', label: 'Comforter / Duvet Cleaning', price: '$40 each' },
                      { key: 'beddingSet', label: 'Bedding Set (full + pillowcases)', price: '$50/set' },
                      { key: 'curtainPanels', label: 'Curtain Panels', price: '$3.50/panel' },
                      { key: 'tablecloths', label: 'Tablecloths', price: '$20 each' },
                    ].map(a => (
                      <div key={a.key} className="flex items-center justify-between gap-3 border border-gray-100 px-4 py-2">
                        <span className="text-sm text-gray-700">{a.label} <span className="text-gray-400 text-xs">({a.price})</span></span>
                        <input
                          type="number"
                          min={0}
                          value={(sel.addOnQty || {})[a.key] || ''}
                          onChange={e => {
                            const qty = e.target.value
                            setSel(s => ({ ...s, addOnQty: { ...(s.addOnQty || {}), [a.key]: qty } }))
                          }}
                          className="w-16 border border-gray-200 px-2 py-1 text-sm text-center"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {category === 'mealprep' && (
            <div>
              <label className={labelClass}>Choose a Plan *</label>
              <select required value={sel.planTier || ''} onChange={e => set('planTier', e.target.value)} className={inputClass}>
                <option value="">Select…</option>
                <option value="starter">Starter — 10 servings/week (~$350/mo)</option>
                <option value="standard">Standard — 20 servings/week (~$675/mo)</option>
                <option value="premium">Premium — 30 servings/week (~$975/mo)</option>
                <option value="luxury">Luxury — 40+ servings/week (~$1,350/mo)</option>
              </select>
            </div>
          )}

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
                  <select required value={sel.tier || ''} onChange={e => set('tier', e.target.value)} className={inputClass}>
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
                  <select required value={sel.tier || ''} onChange={e => set('tier', e.target.value)} className={inputClass}>
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
                  <select required value={sel.tier || ''} onChange={e => set('tier', e.target.value)} className={inputClass}>
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
                    <select required value={sel.subtype || ''} onChange={e => set('subtype', e.target.value)} className={inputClass}>
                      <option value="">Select…</option>
                      <option value="babysitting">Standard Babysitting — $35-45/hr</option>
                      <option value="overnight">Overnight Care — $30-40/hr</option>
                      <option value="nannyhousekeeping">Nanny Plus Housekeeping — $35-45/hr</option>
                      <option value="event">Event/Party Supervision — $30-40/hr</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Number of Hours *</label>
                    <input required type="number" min={2} value={sel.hours || ''} onChange={e => set('hours', e.target.value)} className={inputClass} placeholder="e.g. 4" />
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
                    <select required value={sel.subtype || ''} onChange={e => set('subtype', e.target.value)} className={inputClass}>
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
                    <input required type="number" min={2} value={sel.hours || ''} onChange={e => set('hours', e.target.value)} className={inputClass} placeholder="e.g. 4" />
                  </div>
                </>
              )}

              {category === 'nanny' && sel.mode && (
                <>
                  <div>
                    <label className={labelClass}>Additional Children <span className="text-gray-400 normal-case">(beyond first child)</span></label>
                    <input type="number" min={0} value={sel.extraChildren || ''} onChange={e => set('extraChildren', e.target.value)} className={inputClass} placeholder="0" />
                  </div>
                  <div>
                    <p className={labelClass}>Specialized Care (optional)</p>
                    <div className="space-y-2">
                      {[
                        { v: 'infant', l: 'Infant Care Specialist (+$4/hr)' },
                        { v: 'specialneeds', l: 'Special Needs Care (+$6.50/hr)' },
                        { v: 'bilingual', l: 'Bilingual Nanny (+$5/hr)' },
                      ].map(s => (
                        <label key={s.v} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={(sel.specialized || []).includes(s.v)}
                            onChange={() => setSel(cur => {
                              const list: string[] = cur.specialized || []
                              return { ...cur, specialized: list.includes(s.v) ? list.filter((x: string) => x !== s.v) : [...list, s.v] }
                            })} className="w-4 h-4 accent-chm-red" />
                          {s.l}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {category === 'eldercare' && (sel.mode === 'monthly' || sel.mode === 'hourly') && (
                <div>
                  <p className={labelClass}>Specialized Care (optional)</p>
                  <div className="space-y-2">
                    {[
                      { v: 'dementia', l: "Dementia/Alzheimer's Care (+$6/hr)" },
                      { v: 'postsurgical', l: 'Post-Surgical Recovery Support (+$7.50/hr)' },
                      { v: 'mobility', l: 'Mobility & Physical Assistance (+$4.50/hr)' },
                      { v: 'medication', l: 'Medication Management (+$3/hr)' },
                    ].map(s => (
                      <label key={s.v} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={(sel.specialized || []).includes(s.v)}
                          onChange={() => setSel(cur => {
                            const list: string[] = cur.specialized || []
                            return { ...cur, specialized: list.includes(s.v) ? list.filter((x: string) => x !== s.v) : [...list, s.v] }
                          })} className="w-4 h-4 accent-chm-red" />
                        {s.l}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {(category === 'commercial' || category === 'special') && (
            <div>
              <label className={labelClass}>Tell us more about what you need *</label>
              <textarea required rows={5} value={sel.details || ''} onChange={e => set('details', e.target.value)} className={inputClass}
                placeholder={category === 'commercial'
                  ? 'Property size (sq ft), office type, cleaning frequency needed, any specialized requirements (medical, restaurant, gym, etc.)'
                  : 'Project type, timeline, event date, scope of work, special requirements, etc.'} />
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

  // ---------- STEP 3: REVIEW ----------
  if (step === 3) {
    const lines = summarizeSelections(category, sel)
    return (
      <div className="max-w-2xl">
        <ProgressBar current={3} />
        <div className="space-y-6">
          <div className="border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-chm-black">{CATEGORY_TITLES[category] || 'Your Request'}</p>
              <button type="button" onClick={() => setStep(2)} className="text-xs text-chm-red hover:underline uppercase tracking-widest">
                Edit
              </button>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              {lines.map((l, i) => <li key={i}>• {l}</li>)}
            </ul>
          </div>

          <p className="text-xs text-gray-400">
            Everything look right? Continue to get your {(category === 'commercial' || category === 'special') ? 'custom quote request' : 'instant estimate'}.
          </p>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={() => setStep(2)} className={backBtnClass}>Back</button>
            <button type="button" onClick={() => setStep(4)} className={btnClass}>Looks Good, Continue</button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- STEP 4: CONTACT INFO ----------
  return (
    <div className="max-w-2xl">
      <ProgressBar current={4} />
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Honeypot field — hidden from real users, bots tend to fill every field */}
        <input
          type="text"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {status === 'error' && <p className="text-chm-red text-sm">{errMsg}</p>}

        <div className="flex gap-4 pt-2">
          <button type="button" onClick={() => setStep(3)} className={backBtnClass}>Back</button>
          <button type="submit" disabled={status === 'submitting'} className={btnClass}>
            {status === 'submitting' ? 'Calculating…' : 'Get My Quote'}
          </button>
        </div>
      </form>
    </div>
  )
}
