'use client'
import { useState } from 'react'

type Status = 'pending' | 'confirmed' | 'cancelled'

const COLORS: Record<Status, string> = {
  pending:   'text-amber-700 bg-amber-50 border-amber-200',
  confirmed: 'text-green-700 bg-green-50 border-green-200',
  cancelled: 'text-red-600   bg-red-50   border-red-200',
}

export default function AppointmentStatusButton({
  id,
  initialStatus,
}: {
  id: string
  initialStatus: Status
}) {
  const [status,  setStatus]  = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)

  async function update(newStatus: Status) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) setStatus(newStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={`inline-block text-xs px-2 py-0.5 border font-semibold rounded-sm ${COLORS[status]}`}>
        {status}
      </span>
      <div className="flex gap-3">
        {status !== 'confirmed' && (
          <button
            disabled={loading}
            onClick={() => update('confirmed')}
            className="text-xs text-green-700 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Confirm
          </button>
        )}
        {status !== 'cancelled' && (
          <button
            disabled={loading}
            onClick={() => update('cancelled')}
            className="text-xs text-red-600 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Cancel
          </button>
        )}
        {status !== 'pending' && (
          <button
            disabled={loading}
            onClick={() => update('pending')}
            className="text-xs text-gray-400 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
