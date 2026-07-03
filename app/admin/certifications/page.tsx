'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type StaffProgress = {
  id: string
  staff_name: string
  staff_email: string
  staff_phone: string
  position: string
  module_id: string
  module_title: string
  status: 'in_progress' | 'completed' | 'failed'
  quiz_score: number | null
  completed_at: string | null
}

export default function CertificationsPage() {
  const [progress, setProgress] = useState<StaffProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, completed, failed
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProgress()
  }, [])

  async function fetchProgress() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/certifications')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProgress(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = progress.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter
    const matchesSearch = p.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.staff_email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const completed = progress.filter(p => p.status === 'completed').length
  const failed = progress.filter(p => p.status === 'failed').length
  const inProgress = progress.filter(p => p.status === 'in_progress').length

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-cream py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <Link href="/admin" className="text-xs text-gray-400 hover:text-chm-red uppercase tracking-widest mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="font-serif text-4xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Staff Certifications
          </h1>
          <p className="text-gray-500 text-sm mt-3">Track staff training module completion and certifications</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Completed</p>
            <p className="text-4xl font-bold text-chm-red">{completed}</p>
          </div>
          <div className="border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Failed</p>
            <p className="text-4xl font-bold text-gray-600">{failed}</p>
          </div>
          <div className="border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">In Progress</p>
            <p className="text-4xl font-bold text-gray-400">{inProgress}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 text-sm font-semibold uppercase tracking-widest transition-all ${
                filter === 'all'
                  ? 'bg-chm-red text-white'
                  : 'border-2 border-gray-200 text-gray-600 hover:border-chm-red'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-6 py-2 text-sm font-semibold uppercase tracking-widest transition-all ${
                filter === 'completed'
                  ? 'bg-chm-red text-white'
                  : 'border-2 border-gray-200 text-gray-600 hover:border-chm-red'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-6 py-2 text-sm font-semibold uppercase tracking-widest transition-all ${
                filter === 'failed'
                  ? 'bg-chm-red text-white'
                  : 'border-2 border-gray-200 text-gray-600 hover:border-chm-red'
              }`}
            >
              Failed
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
          />
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading certifications...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">No staff certifications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-600">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-600">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-600">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-600">Completed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{p.staff_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.staff_email}</td>
                    <td className="px-4 py-3 text-gray-600">{p.position}</td>
                    <td className="px-4 py-3 text-gray-600">{p.module_title}</td>
                    <td className="px-4 py-3 font-semibold text-chm-red">{p.quiz_score ? `${p.quiz_score}%` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 ${
                        p.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : p.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.completed_at ? new Date(p.completed_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
