'use client'

import { useState } from 'react'

const POSITIONS = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary / Chef',
  'Nanny / Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]

export default function WelcomeCenterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    address: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/welcome-center/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : {}
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-4">Thank You</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Thank you, <strong>{form.full_name}</strong>. We've received your information and sent a confirmation email to <strong>{form.email}</strong>.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Our team will review your application and be in touch within 1-2 business days with your offer letter and next steps..
          </p>
          <p className="text-gray-400 text-xs">
            Questions? Call us at <strong>202-579-2944</strong> (Mon–Sat, 9 AM–9 PM)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">Welcome to Our Team</h1>
          <p className="text-sm text-gray-500">Join Convenience Hub of Maryland and serve families across the DMV.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name *</label>
            <input
              required
              type="text"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
              placeholder="jane@example.com"
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

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Position *</label>
            <select
              required
              value={form.position}
              onChange={e => set('position', e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white"
            >
              <option value="">Select a position…</option>
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
              placeholder="123 Main St, Silver Spring, MD"
            />
          </div>

          {(status === 'error' || errorMsg) && (
            <p className="text-chm-red text-sm">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-chm-red text-white py-4 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit Application'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Mon–Sat 9 AM–9 PM · 202-579-2944
          </p>
        </form>
      </div>
    </div>
  )
}
