'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'draft' | 'sent' | 'signed' | 'expired'

const STATUS_COLORS: Record<Status, string> = {
  draft: 'text-amber-700 bg-amber-50 border-amber-200',
  sent: 'text-blue-700 bg-blue-50 border-blue-200',
  signed: 'text-green-700 bg-green-50 border-green-200',
  expired: 'text-red-600 bg-red-50 border-red-200',
}

export default function ApplicantStatusButton({
  applicantId,
  initialStatus,
}: {
  applicantId: string
  initialStatus: Status
}) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)

  async function updateStatus(newStatus: Status) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/offer-letters/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: applicantId, status: newStatus }),
      })
      if (res.ok) setStatus(newStatus)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this applicant? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/offer-letters/update-status', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: applicantId }),
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
      <span className={`inline-block text-xs px-2 py-0.5 border font-semibold rounded-sm ${STATUS_COLORS[status]}`}>
        {status}
      </span>
      <div className="flex gap-2 flex-wrap">
        {status !== 'sent' && (
          <button
            disabled={loading}
            onClick={() => updateStatus('sent')}
            className="text-xs text-blue-700 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Mark Sent
          </button>
        )}
        {status !== 'signed' && (
          <button
            disabled={loading}
            onClick={() => updateStatus('signed')}
            className="text-xs text-green-700 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Mark Signed
          </button>
        )}
        {status !== 'expired' && (
          <button
            disabled={loading}
            onClick={() => updateStatus('expired')}
            className="text-xs text-red-600 hover:underline underline-offset-2 disabled:opacity-40"
          >
            Mark Expired
          </button>
        )}
        {status !== 'draft' && (
          <button
            disabled={loading}
            onClick={() => updateStatus('draft')}
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
