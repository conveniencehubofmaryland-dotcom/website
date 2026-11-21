'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderShipControl({ orderId, tracking }: { orderId: string; tracking: string | null }) {
  const router = useRouter()
  const [value, setValue] = useState(tracking ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function markShipped() {
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipped`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking: value }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not save the tracking number.')
      } else {
        setMessage(data.emailed
          ? 'Saved. The customer has been emailed the tracking number.'
          : 'Saved. The email to the customer could not be sent, so send them the tracking number yourself.')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Tracking number</label>
      <div className="flex flex-wrap gap-2">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="e.g. 9400 1000 0000 0000 0000 00"
          className="flex-1 min-w-[240px] border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-chm-red"
        />
        <button
          type="button"
          onClick={markShipped}
          disabled={busy || !value.trim()}
          className="bg-chm-red text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? 'Saving…' : tracking ? 'Update and email tracking' : 'Mark shipped and email tracking'}
        </button>
      </div>
      {message && <p className="text-sm text-green-700 mt-3">{message}</p>}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  )
}
