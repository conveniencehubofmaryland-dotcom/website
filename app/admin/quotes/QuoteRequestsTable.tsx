/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'

type LineItem = { label: string; amount: number }

type QuoteRequest = {
  id: string
  name: string
  email: string
  phone: string
  category: string
  selections: Record<string, any> & { breakdown?: LineItem[] }
  estimated_subtotal: number | null
  estimated_tax: number | null
  estimated_total: number | null
  status: 'new' | 'contacted' | 'booked' | 'closed'
  created_at: string
}

const STATUS_FLOW: Record<string, string> = {
  new: 'contacted',
  contacted: 'booked',
  booked: 'closed',
  closed: 'closed',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  booked: 'Booked',
  closed: 'Closed',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  booked: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
}

const CATEGORY_LABELS: Record<string, string> = {
  cleaning: 'Cleaning',
  laundry: 'Laundry',
  mealprep: 'Meal Prep',
  other: 'Custom / Other',
}

export default function QuoteRequestsTable({ requests: initialRequests }: { requests: QuoteRequest[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filtered = requests.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesCategory && matchesSearch
  })

  async function advanceStatus(req: QuoteRequest) {
    const nextStatus = STATUS_FLOW[req.status]
    setBusyId(req.id)
    try {
      const res = await fetch(`/api/admin/quotes/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setRequests(rs => rs.map(r => r.id === req.id ? { ...r, status: nextStatus as QuoteRequest['status'] } : r))
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    } finally {
      setBusyId(null)
    }
  }

  async function deleteRequest(id: string) {
    if (!confirm('Delete this quote request? This cannot be undone.')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRequests(rs => rs.filter(r => r.id !== id))
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 px-4 py-2 text-sm bg-white">
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="booked">Booked</option>
            <option value="closed">Closed</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border border-gray-200 px-4 py-2 text-sm bg-white">
            <option value="all">All Categories</option>
            <option value="cleaning">Cleaning</option>
            <option value="laundry">Laundry</option>
            <option value="mealprep">Meal Prep</option>
            <option value="other">Custom / Other</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No quote requests found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const isExpanded = expandedId === req.id
            const isBusy = busyId === req.id
            return (
              <div key={req.id} className="border border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-chm-black">{req.name}</p>
                      <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 ${STATUS_COLORS[req.status]}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                      <span className="text-xs text-gray-400 uppercase tracking-widest">{CATEGORY_LABELS[req.category] || req.category}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{req.email} · {req.phone}</p>
                  </div>

                  <div className="text-right">
                    {req.estimated_total != null ? (
                      <p className="font-semibold text-chm-red">${req.estimated_total.toFixed(2)}</p>
                    ) : (
                      <p className="text-xs text-gray-400">Custom Quote</p>
                    )}
                    <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : req.id)}
                      className="text-xs text-chm-red hover:underline uppercase tracking-widest"
                    >
                      {isExpanded ? 'Hide' : 'Details'}
                    </button>
                    {req.status !== 'closed' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => advanceStatus(req)}
                        className="text-xs bg-chm-black text-white px-3 py-2 uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {isBusy ? '...' : `Mark ${STATUS_LABELS[STATUS_FLOW[req.status]]}`}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => deleteRequest(req.id)}
                      className="text-xs text-red-600 hover:underline uppercase tracking-widest disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    {req.selections?.breakdown && req.selections.breakdown.length > 0 ? (
                      <div className="mb-3">
                        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Price Breakdown</p>
                        {req.selections.breakdown.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-600">
                            <span>{item.label}</span>
                            <span>{item.amount < 0 ? '-' : ''}${Math.abs(item.amount).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Raw Selections</p>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 border border-gray-100">
                      {JSON.stringify(req.selections, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
