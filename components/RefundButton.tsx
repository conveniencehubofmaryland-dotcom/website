'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = { appointmentId: string; amount: number; refunded: boolean }

export default function RefundButton({ appointmentId, amount, refunded }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  if (refunded) return <p className="text-xs text-gray-400 mt-1">Refunded</p>

  async function refund() {
    if (!window.confirm(`Refund $${amount.toFixed(2)} to the customer's card and cancel this booking? This cannot be undone.`)) return
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appointmentId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Refund failed.')
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Refund failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={refund}
        disabled={busy}
        className="text-xs uppercase tracking-widest border border-chm-red text-chm-red px-3 py-1.5 hover:bg-chm-red hover:text-white transition-colors disabled:opacity-50"
      >
        {busy ? 'Refunding…' : `Refund $${amount.toFixed(2)}`}
      </button>
      {err && <p className="text-xs text-chm-red mt-1 max-w-[220px]">{err}</p>}
    </div>
  )
}
