'use client'

import { useEffect, useState } from 'react'

type Plan = {
  status: 'active' | 'paused' | 'cancelled'
  frequency: string
  amount: number
  nextChargeDate: string | null
  service: string | null
  name: string | null
}

export default function ManagePlan({ token }: { token: string }) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/plans?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) setError(data.error || 'This link is not valid.')
        else setPlan(data.plan)
      })
      .catch(() => {
        if (!cancelled) setError('Please try again in a moment.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  async function act(action: 'pause' | 'resume' | 'cancel') {
    if (action === 'cancel' && !window.confirm('Cancel this recurring plan? No more charges will be made. This cannot be undone from this page.')) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'The change could not be made.')
        return
      }
      setPlan(data.plan)
      setMessage(
        action === 'pause'
          ? 'Your plan is paused. No charges will be made until you resume it.'
          : action === 'resume'
            ? 'Your plan is active again.'
            : 'Your plan is cancelled. No more charges will be made.'
      )
    } catch {
      setError('Please try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading your plan…</p>
  if (error && !plan) return <p className="text-sm text-chm-red">{error}</p>
  if (!plan) return null

  const statusLabel = plan.status === 'active' ? 'Active' : plan.status === 'paused' ? 'Paused' : 'Cancelled'
  const btn = 'w-full bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50'
  const btnOutline = 'w-full border border-chm-red text-chm-red px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-cream transition-colors disabled:opacity-50'

  return (
    <div className="space-y-6 text-sm">
      <div className="border border-gray-200 bg-cream p-5 space-y-2">
        {plan.name && <p><strong>Client:</strong> {plan.name}</p>}
        {plan.service && <p><strong>Service:</strong> {plan.service}</p>}
        <p><strong>Price:</strong> ${plan.amount.toFixed(2)} every {plan.frequency}</p>
        <p><strong>Status:</strong> {statusLabel}</p>
        {plan.status === 'active' && plan.nextChargeDate && (
          <p><strong>Next charge:</strong> {plan.nextChargeDate}</p>
        )}
      </div>

      {message && <p className="text-green-700 font-semibold">{message}</p>}
      {error && <p className="text-chm-red">{error}</p>}

      {plan.status === 'active' && (
        <button type="button" onClick={() => act('pause')} disabled={busy} className={btnOutline}>
          Pause plan
        </button>
      )}
      {plan.status === 'paused' && (
        <button type="button" onClick={() => act('resume')} disabled={busy} className={btn}>
          Resume plan
        </button>
      )}
      {plan.status !== 'cancelled' && (
        <button type="button" onClick={() => act('cancel')} disabled={busy} className={btnOutline}>
          Cancel plan
        </button>
      )}

      <p className="text-xs text-gray-500">
        Questions? Call or text <a href="tel:+12025792944" className="text-chm-red">202-579-2944</a>.
      </p>
    </div>
  )
}
