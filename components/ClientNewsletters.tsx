'use client'

import { useEffect, useState } from 'react'

type Item = { id: string; title: string; body: string; created_at: string }

// Public newsletters for clients, shown on the Gallery page.
export default function ClientNewsletters() {
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
    <section id="newsletters" className="scroll-mt-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-8 h-px bg-chm-red" />
        <h2 className="font-serif text-3xl text-chm-black">Newsletter</h2>
      </div>
      <div className="space-y-10">
        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {error && <p className="text-gray-600 text-sm">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-gray-600 text-sm">No newsletters yet.</p>}
        {items.map(n => (
          <article key={n.id} className="border-b border-gray-200 pb-10">
            <p className="text-xs text-gray-500 mb-2">{new Date(n.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h3 className="font-serif text-2xl text-chm-black mb-4">{n.title}</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{n.body}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
