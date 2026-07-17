'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PAY_STRUCTURE } from '@/lib/pay-structure'
import type { PayTier } from '@/lib/pay-structure'

type Props = {
  applicantId: string
  applicantName: string
  position: string
  onClose: () => void
}

export default function OfferLetterModal({ applicantId, applicantName, position, onClose }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    hourly_rate: '',
    start_date: '',
    manager_name: '',
    deadline_date: '',
    benefits_summary: '',
    pay_frequency: 'hour',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const positionData = PAY_STRUCTURE[position]
  const tiers = positionData?.tiers || []

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/offer-letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          position,
          salary_annual: parseFloat(form.hourly_rate),
          start_date: form.start_date,
          benefits_summary: form.benefits_summary || null,
          manager_name: form.manager_name,
          deadline_date: form.deadline_date,
          pay_frequency: form.pay_frequency,
        }),
      })
      const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : {}
      if (!res.ok) throw new Error(data.error ?? 'Failed to send offer')
      setStatus('success')
      setTimeout(() => {
        router.refresh()
        onClose()
      }, 1500)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="font-serif text-xl text-chm-black">{applicantName}</h2>
            <p className="text-sm text-gray-500">{position}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-chm-black text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <p className="text-green-700 font-semibold mb-2">Offer sent successfully!</p>
            <p className="text-sm text-gray-500">Closing in a moment…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pay Structure Tiers */}
            {tiers.length > 0 && (
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-3">Pay Tiers</p>
                <div className="space-y-2 text-xs">
                  {tiers.map((tier: PayTier) => (
                    <div key={tier.level} className="flex justify-between text-gray-700">
                      <span>{tier.level}</span>
                      <span className="font-semibold">${tier.hourly_min.toFixed(2)}–${tier.hourly_max.toFixed(2)}/hr</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hourly Rate */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Hourly Rate *</label>
              <input
                required
                type="number"
                step="0.01"
                value={form.hourly_rate}
                onChange={e => set('hourly_rate', e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
                placeholder="18.50"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Start Date *</label>
              <input
                required
                type="date"
                value={form.start_date}
                onChange={e => set('start_date', e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
              />
            </div>

            {/* Manager Name */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Manager Name *</label>
              <input
                required
                type="text"
                value={form.manager_name}
                onChange={e => set('manager_name', e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
                placeholder="Jane Doe"
              />
            </div>

            {/* Deadline Date */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Response Deadline *</label>
              <input
                required
                type="date"
                value={form.deadline_date}
                onChange={e => set('deadline_date', e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
              />
            </div>

            {/* Benefits Summary */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Additional Benefits (optional)</label>
              <textarea
                rows={3}
                value={form.benefits_summary}
                onChange={e => set('benefits_summary', e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors resize-none"
                placeholder="e.g., Health insurance, flexible schedule"
              />
            </div>

            {(status === 'error' || errorMsg) && (
              <p className="text-chm-red text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending…' : 'Send Offer Letter'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
