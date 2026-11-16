'use client'

import { useState } from 'react'

// Admin: find and remove stored files that no record uses. Check first, then delete.
export default function StorageCleanupPage() {
  const [paths, setPaths] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function check() {
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/storage-cleanup')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not check the files.')
      setPaths(data.paths)
      setMessage(data.count === 0 ? 'No unlinked files found.' : `${data.count} unlinked file(s) found. Review the list, then delete if correct.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not check the files.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!paths || paths.length === 0) return
    if (!window.confirm(`Permanently delete ${paths.length} file(s) that no record uses? This cannot be undone.`)) return
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/storage-cleanup', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not delete the files.')
      setMessage(`Deleted ${data.deleted} file(s).${data.failed ? ` ${data.failed} could not be deleted.` : ''}`)
      setPaths(null)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not delete the files.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-chm-dark">Storage Cleanup</h2>
        <p className="text-gray-600">Finds stored files that no record uses anymore, such as files from deleted applicants. Files uploaded in the last 24 hours are never listed.</p>
      </div>

      <div className="flex gap-3">
        <button onClick={check} disabled={busy} className="bg-gray-700 text-white px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded hover:bg-gray-800 disabled:opacity-50">
          {busy ? 'Working…' : 'Check for unlinked files'}
        </button>
        {paths && paths.length > 0 && (
          <button onClick={remove} disabled={busy} className="bg-red-600 text-white px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded hover:bg-red-700 disabled:opacity-50">
            Delete these files
          </button>
        )}
      </div>

      {message && <p className="text-sm text-gray-700">{message}</p>}

      {paths && paths.length > 0 && (
        <ul className="bg-white border border-gray-200 rounded divide-y divide-gray-100 text-xs font-mono max-h-96 overflow-auto">
          {paths.map(p => <li key={p} className="px-3 py-2 break-all">{p}</li>)}
        </ul>
      )}
    </div>
  )
}
