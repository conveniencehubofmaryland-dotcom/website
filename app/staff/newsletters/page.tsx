'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Item = { id: string; title: string; body: string; created_at: string }

// Newsletters for staff. Only visible after signing in to the staff portal.
export default function StaffNewslettersPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let token: string | null = null
    try {
      token = localStorage.getItem('staff_session_token')
    } catch {
      token = null
    }
    if (!token) {
      setError('Please sign in to the staff portal to read staff newsletters.')
      setLoading(false)
      return
    }
    fetch('/api/newsletters?audience=staff', { headers: { 'x-staff-token': token } })
      .then(async res => {
        if (!res.ok) throw new Error()
        setItems(await res.json())
      })
      .catch(() => setError('Please sign in to the staff portal to read staff newsletters.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/staff" className="text-sm text-chm-red hover:underline">Back to the staff portal</Link>
        <h1 className="font-serif text-4xl text-chm-black mt-4 mb-8">Staff Newsletters</h1>
        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {error && <p className="text-gray-600 text-sm">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-gray-600 text-sm">No newsletters yet.</p>}
        <div className="space-y-6">
          {items.map(n => (
            <article key={n.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-xs text-gray-500 mb-2">{new Date(n.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h2 className="font-serif text-2xl text-chm-black mb-3">{n.title}</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">{n.body}</div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
