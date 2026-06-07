'use client'
import { useState } from 'react'

export default function ApplicationActionButton({
  id,
  status,
}: {
  id: string
  status: string
}) {
  const [deleting, setDeleting] = useState(false)

  async function deleteApplication() {
    if (!confirm('Are you sure you want to delete this application? This cannot be undone.')) {
      return
    }
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/careers/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        window.location.reload()
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex gap-3 shrink-0">
      <button
        disabled={deleting}
        onClick={deleteApplication}
        className="text-xs text-red-700 hover:underline underline-offset-2 disabled:opacity-40 font-semibold"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}
