'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MemberActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    if (!confirm('Delete this member? This cannot be undone.')) return
    setLoading(true)
    try {
      await fetch('/api/admin/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={`inline-block text-xs px-2 py-0.5 border font-semibold rounded-sm ${active ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>
        {active ? 'Active' : 'Inactive'}
      </span>
      <div className="flex gap-3">
        <button disabled={loading} onClick={toggle}
          className={`text-xs hover:underline underline-offset-2 disabled:opacity-40 ${active ? 'text-gray-400' : 'text-green-700'}`}>
          {active ? 'Deactivate' : 'Activate'}
        </button>
        <button disabled={loading} onClick={remove}
          className="text-xs text-gray-300 hover:text-red-600 transition-colors disabled:opacity-40">
          Delete
        </button>
      </div>
    </div>
  )
}
