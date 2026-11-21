'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'pending' | 'active' | 'deactivated'

const BADGE: Record<Status, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'text-green-700 bg-green-50 border-green-200' },
  pending: { label: 'Pending', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  deactivated: { label: 'Deactivated', cls: 'text-gray-600 bg-gray-100 border-gray-300' },
}

export default function MemberActions({ id, status, tier }: { id: string; status: Status; tier: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function setStatus(next: Status) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not update this member.')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    if (!confirm('Delete this member? This cannot be undone.')) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not delete this member.')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function setTier(next: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tier: next }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not change the tier.')
        return
      }
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const badge = BADGE[status] ?? BADGE.pending

  return (
    <div className="flex flex-col gap-1.5">
      <span className={`inline-block w-fit text-xs px-2 py-0.5 border font-semibold rounded-sm ${badge.cls}`}>{badge.label}</span>
      <div className="flex gap-3 flex-wrap">
        {status !== 'active' && (
          <button disabled={loading} onClick={() => setStatus('active')}
            className="text-xs font-semibold text-green-700 hover:underline underline-offset-2 disabled:opacity-40">
            Approve
          </button>
        )}
        {status === 'active' && (
          <button disabled={loading} onClick={() => setStatus('deactivated')}
            className="text-xs text-amber-700 hover:underline underline-offset-2 disabled:opacity-40">
            Deactivate
          </button>
        )}
        {status === 'deactivated' && (
          <button disabled={loading} onClick={() => setStatus('active')}
            className="text-xs text-green-700 hover:underline underline-offset-2 disabled:opacity-40">
            Reactivate
          </button>
        )}
        <button disabled={loading} onClick={remove}
          className="text-xs text-red-600 hover:underline underline-offset-2 disabled:opacity-40">
          Delete
        </button>
      </div>
      <select value={tier} disabled={loading} onChange={e => setTier(e.target.value)} className="text-xs border border-gray-200 px-2 py-1 bg-white w-fit">
        <option value="free">Free (1.5%)</option>
        <option value="premium">Premium (3%)</option>
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
