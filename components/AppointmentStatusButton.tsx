'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [status,  setStatus]  = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)

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

  async function handleDelete() {
    if (!confirm('Delete this appointment? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setDeleted(true)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  if (deleted) return <span className="text-xs text-gray-300">Deleted</span>

  return (
    <div className="flex flex-col gap-2">
      <span className={`inline-block text-xs px-2 py-0.5 border font-semibold rounded-sm ${COLORS[status]}`}>
        {status}
      </span>
      <div className="flex gap-3 flex-wrap">
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
        <button
          disabled={loading}
          onClick={handleDelete}
          className="text-xs text-gray-300 hover:text-red-600 transition-colors disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
