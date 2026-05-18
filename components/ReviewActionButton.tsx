'use client'
import { useState } from 'react'

export default function ReviewActionButton({
  id,
  initialApproved,
}: {
  id: string
  initialApproved: boolean
}) {
  const [approved, setApproved] = useState(initialApproved)
  const [loading,  setLoading]  = useState(false)

  async function update(newApproved: boolean) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: newApproved }),
      })
      if (res.ok) setApproved(newApproved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <span className={`text-xs px-2 py-0.5 border rounded-sm font-semibold ${
        approved
          ? 'text-green-700 bg-green-50 border-green-200'
          : 'text-amber-700 bg-amber-50 border-amber-200'
      }`}>
        {approved ? 'Live' : 'Pending'}
      </span>
      <div className="flex gap-3">
        {!approved ? (
          <button
            disabled={loading}
            onClick={() => update(true)}
            className="text-xs text-green-700 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Approve
          </button>
        ) : (
          <button
            disabled={loading}
            onClick={() => update(false)}
            className="text-xs text-red-600 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  )
}
