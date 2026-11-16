'use client'

import { useEffect, useState } from 'react'

type Newsletter = {
  id: string
  audience: 'clients' | 'staff'
  title: string
  body: string
  published: boolean
  created_at: string
}

const AUDIENCE_LABEL: Record<string, string> = { clients: 'Clients (public website)', staff: 'Staff (staff portal)' }

export default function NewslettersAdminPage() {
  const [items, setItems] = useState<Newsletter[]>([])
  const [audience, setAudience] = useState<'clients' | 'staff'>('clients')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [published, setPublished] = useState(true)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/newsletters')
    if (res.ok) setItems(await res.json())
    else setMessage('Could not load newsletters.')
  }

  useEffect(() => {
    load()
  }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience, title, body, published }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error || 'Could not save the newsletter.')
        return
      }
      setTitle('')
      setBody('')
      setMessage('Newsletter saved.')
      load()
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Delete this newsletter? This cannot be undone.')) return
    const res = await fetch(`/api/admin/newsletters?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
    else setMessage('Could not delete the newsletter.')
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-chm-dark">Newsletters</h2>
        <p className="text-gray-600">Write one newsletter for clients (shown on the public website) or for staff (shown in the staff portal).</p>
      </div>

      <form onSubmit={create} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Audience</label>
          <select value={audience} onChange={e => setAudience(e.target.value as 'clients' | 'staff')} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="clients">Clients (public website)</option>
            <option value="staff">Staff (staff portal)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Message</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={8} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
          Publish now (uncheck to save as a draft)
        </label>
        <button type="submit" disabled={saving} className="bg-chm-red text-white px-5 py-2 text-xs font-semibold uppercase tracking-widest rounded hover:bg-red-700 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Newsletter'}
        </button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">All newsletters</h3>
        {items.length === 0 && <p className="text-gray-500 text-sm">No newsletters yet.</p>}
        {items.map(n => (
          <div key={n.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-900">{n.title}</p>
              <p className="text-xs text-gray-500">{AUDIENCE_LABEL[n.audience]} · {n.published ? 'Published' : 'Draft'} · {new Date(n.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => remove(n.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
