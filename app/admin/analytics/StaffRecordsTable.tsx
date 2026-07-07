'use client'

import { useState } from 'react'

type StaffProgress = {
  id: string
  staff_name: string
  staff_email: string
  staff_phone: string | null
  position: string | null
  module_id: string
  module_title: string
  status: 'in_progress' | 'completed' | 'failed'
  quiz_score: number | null
  completed_at: string | null
}

export default function StaffRecordsTable({ records }: { records: StaffProgress[] }) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = records.filter(p => {
    const matchesStatus = filter === 'all' || p.status === filter
    const matchesSearch =
      p.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.staff_email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 text-sm font-semibold uppercase tracking-widest transition-all ${
              filter === 'all' ? 'bg-chm-red text-white' : 'border-2 border-gray-200 text-gray-600 hover:border-chm-red'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-2 text-sm font-semibold uppercase tracking-widest transition-all ${
              filter === 'completed' ? 'bg-chm-red text-white' : 'border-2 border-gray-200 text-gray-600 hover:border-chm-red'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-6 py-2 text-sm font-semibold uppercase tracking-widest transition-all ${
              filter === 'failed' ? 'bg-chm-red text-white' : 'border-2 border-gray-200 text-gray-600 hover:border-chm-red'
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

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">No staff records found.</p>
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
  )
}
