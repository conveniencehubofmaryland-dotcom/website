'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['new', 'reviewed', 'contacted', 'hired', 'rejected'] as const

interface Props {
  id: string
  initialStatus: string
}

export default function ApplicationStatusSelect({ id, initialStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setStatus(next)
    setSaving(true)
    try {
      await fetch(`/api/admin/careers/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select value={status} onChange={handleChange} disabled={saving}
        className="border border-gray-200 px-3 py-2 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white disabled:opacity-60">
        {STATUSES.map(s => (
          <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      {saving && <span className="text-xs text-gray-400">Saving…</span>}
    </div>
  )
}
