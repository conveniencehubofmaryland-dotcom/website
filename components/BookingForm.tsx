'use client'
import { useState } from 'react'
import type { Service } from '@/lib/types'

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM',
]

type Props = {
  services: Pick<Service, 'id' | 'title' | 'price_from'>[]
}

export default function BookingForm({ services }: Props) {
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    email: '',
    service_id: '',
    appointment_date: '',
    time_slot: '',
    notes: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Earliest selectable date — skip Sunday
  const todayDate = new Date()
  if (todayDate.getDay() === 0) todayDate.setDate(todayDate.getDate() + 1)
  const today = todayDate.toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    if (new Date(form.appointment_date + 'T12:00:00').getDay() === 0) {
      setErrorMsg('We are closed on Sundays. Please select a Monday–Saturday date.')
      setStatus('idle')
      return
    }
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        <h2 className="font-serif text-3xl text-chm-black mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
          Booking Received
        </h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
          Thank you, <strong>{form.customer_name}</strong>. We&apos;ll confirm your booking at{' '}
          <strong>{form.phone}</strong> within 1 hour during business hours (Mon–Sat, 9 AM–9 PM).
        </p>
        <a href="/" className="text-chm-red text-xs font-semibold uppercase tracking-widest hover:underline underline-offset-4">
          ← Back to Home
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">

      {/* Personal info */}
      <fieldset className="space-y-5">
        <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">Your Information</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name *</label>
            <input
              required
              type="text"
              value={form.customer_name}
              onChange={e => set('customer_name', e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
              placeholder="202-555-0100"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
            Email <span className="text-gray-400 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
            placeholder="jane@example.com"
          />
        </div>
      </fieldset>

      <div className="h-px bg-gray-100" />

      {/* Service + schedule */}
      <fieldset className="space-y-5">
        <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">Service &amp; Schedule</legend>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Service *</label>
          <select
            required
            value={form.service_id}
            onChange={e => set('service_id', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white"
          >
            <option value="">Select a service…</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.title}{s.price_from ? ` — ${s.price_from}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Preferred Date * <span className="text-gray-400 normal-case tracking-normal">(Mon–Sat only)</span>
            </label>
            <input
              required
              type="date"
              min={today}
              max={maxDate}
              value={form.appointment_date}
              onChange={e => {
                const d = new Date(e.target.value + 'T12:00:00')
                if (d.getDay() === 0) {
                  // Auto-advance Sunday → Monday
                  d.setDate(d.getDate() + 1)
                  const nextMonday = d.toISOString().split('T')[0]
                  setErrorMsg('We are closed on Sundays — moved to the next available Monday.')
                  set('appointment_date', nextMonday)
                } else {
                  setErrorMsg('')
                  set('appointment_date', e.target.value)
                }
              }}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Preferred Time *</label>
            <select
              required
              value={form.time_slot}
              onChange={e => set('time_slot', e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white"
            >
              <option value="">Select a time…</option>
              {TIME_SLOTS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <div className="h-px bg-gray-100" />

      {/* Notes */}
      <fieldset>
        <legend className="text-xs uppercase tracking-[0.2em] text-chm-red font-semibold block mb-5">Additional Notes</legend>
        <textarea
          rows={4}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors resize-none"
          placeholder="Address, special requirements, frequency of service…"
        />
      </fieldset>

      {status === 'error' && (
        <p className="text-chm-red text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-chm-red text-white py-4 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting…' : 'Request Booking'}
      </button>

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        Mon–Sat 9 AM–9 PM &nbsp;·&nbsp; Closed Sundays &nbsp;·&nbsp; 202-579-2944
      </p>
    </form>
  )
}
