'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LABELS: Record<string, string> = { paid: 'Paid', ready: 'Ready for pickup / shipped', completed: 'Completed', cancelled: 'Cancelled' }

export default function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [current, setCurrent] = useState(status)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function change(next: string) {
    if (next === current) return
    if (next === 'cancelled' && !window.confirm('Cancel this order? Items go back into stock. If the card was charged, refund it in Clover yourself.')) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not update the order.')
      } else {
        setCurrent(next)
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
      <div className="flex flex-wrap gap-2">
        {Object.keys(LABELS).map(s => (
          <button
            key={s}
            type="button"
            disabled={busy || (current === 'cancelled' && s !== 'cancelled')}
            onClick={() => change(s)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest border transition-colors disabled:opacity-40 ${
              current === s ? 'bg-chm-black text-white border-chm-black' : 'bg-white text-gray-700 border-gray-300 hover:border-chm-black'
            }`}
          >
            {LABELS[s]}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
    </div>
  )
}
