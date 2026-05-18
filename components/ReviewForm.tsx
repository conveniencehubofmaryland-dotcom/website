'use client'
import { useState } from 'react'

type Props = {
  services: { id: string; title: string }[]
}

export default function ReviewForm({ services }: Props) {
  const [form, setForm] = useState({
    customer_name: '',
    rating: 5,
    body: '',
    service_mentioned: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (status === 'success') {
    return (
      <div className="py-8 max-w-lg">
        <div className="w-12 h-px bg-chm-red mb-6" />
        <p className="font-serif text-2xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          Thank You!
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your review has been submitted and will appear once approved — usually within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Your Name *</label>
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
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Service Used</label>
          <select
            value={form.service_mentioned}
            onChange={e => set('service_mentioned', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white"
          >
            <option value="">Select service…</option>
            {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Rating *</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => set('rating', n)}
              className={`text-3xl leading-none transition-colors ${n <= form.rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-200'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Your Review *</label>
        <textarea
          required
          rows={5}
          value={form.body}
          onChange={e => set('body', e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors resize-none"
          placeholder="Tell us about your experience…"
        />
      </div>

      {status === 'error' && <p className="text-chm-red text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
