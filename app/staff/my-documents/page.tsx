'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Item = {
  id: string
  kind: 'certificate' | 'upload' | 'w9' | 'badge'
  name: string
  date: string | null
  review: 'pending' | 'cleared' | 'not_cleared' | null
  url: string | null
}

const REVIEW_TEXT: Record<string, string> = {
  pending: 'Pending review',
  cleared: 'Cleared',
  not_cleared: 'Not cleared: please send a corrected copy',
}
const REVIEW_CLASS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  cleared: 'bg-green-100 text-green-800',
  not_cleared: 'bg-orange-100 text-orange-800',
}

// Staff: their own documents, certificates and badge.
export default function MyDocumentsPage() {
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
      setError('Please sign in to the staff portal to see your documents.')
      setLoading(false)
      return
    }
    fetch('/api/staff/my-documents', { headers: { 'x-staff-token': token } })
      .then(async res => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Could not load your documents.')
        setItems(data.items || [])
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load your documents.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/staff" className="text-sm text-chm-red hover:underline">Back to the staff portal</Link>
        <h1 className="font-serif text-4xl text-chm-black mt-4 mb-2">My Documents</h1>
        <p className="text-gray-600 text-sm mb-8">Your certificates, forms, and badge. Items marked Pending are being reviewed by HR.</p>

        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {error && <p className="text-chm-red text-sm">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-gray-600 text-sm">You have no documents yet.</p>}

        <div className="space-y-4">
          {items.map(item => (
            <div key={`${item.kind}-${item.id}`} className="bg-white border border-gray-200 rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-chm-black">{item.name}</p>
                {item.date && <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>}
                {item.review && (
                  <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${REVIEW_CLASS[item.review]}`}>
                    {REVIEW_TEXT[item.review]}
                  </span>
                )}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded whitespace-nowrap">
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
