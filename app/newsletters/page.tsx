'use client'

import { useEffect, useState } from 'react'

type Item = { id: string; title: string; body: string; created_at: string }

// Public newsletters for clients.
export default function ClientNewslettersPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/newsletters?audience=clients')
      .then(async res => {
        if (!res.ok) throw new Error()
        setItems(await res.json())
      })
      .catch(() => setError('Newsletters are not available right now. Please check back soon.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-cream py-12 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Newsletter</p>
          <h1 className="font-serif text-4xl md:text-5xl text-chm-black">News from Convenience Hub of Maryland</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {error && <p className="text-gray-600 text-sm">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-gray-600 text-sm">No newsletters yet.</p>}
        {items.map(n => (
          <article key={n.id} className="border-b border-gray-200 pb-10">
            <p className="text-xs text-gray-500 mb-2">{new Date(n.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 className="font-serif text-2xl text-chm-black mb-4">{n.title}</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{n.body}</div>
          </article>
        ))}
      </div>
    </div>
  )
}
