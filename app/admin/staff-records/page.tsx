'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface StaffRecord {
  id: string
  full_name: string
  email: string
  phone: string
  sex: string
  date_of_birth: string
  position: string
  years_of_experience: number
  acknowledged_1099: boolean
  onboarding_status: string
  created_at: string
  no_show_count: number
}

export default function StaffRecordsPage() {
  const [records, setRecords] = useState<StaffRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPosition, setFilterPosition] = useState('')

  const POSITIONS = [
    'Cleaning Specialist',
    'Laundry Handler',
    'Culinary/Chef',
    'Nanny/Childcare Specialist',
    'Care Companion (Adult/Senior)',
    'Housekeeping Staff',
  ]

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('offer_letter_applicants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (err) {
      console.error('Failed to fetch records:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm)

    const matchesPosition = !filterPosition || record.position === filterPosition

    return matchesSearch && matchesPosition
  })

  const exportCSV = () => {
    const headers = [
      'Full Name',
      'Email',
      'Phone',
      'Sex',
      'Date of Birth',
      'Position',
      'Years of Experience',
      '1099 Acknowledged',
      'Onboarding Status',
      'No-Shows',
      'Joined Date',
    ]

    const rows = filteredRecords.map(r => [
      r.full_name,
      r.email,
      r.phone,
      r.sex,
      r.date_of_birth,
      r.position,
      r.years_of_experience,
      r.acknowledged_1099 ? 'Yes' : 'No',
      r.onboarding_status,
      r.no_show_count || 0,
      new Date(r.created_at).toLocaleDateString(),
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `staff-records-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading staff records…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="w-12 h-px bg-chm-red mb-4" />
        <h1 className="font-serif text-4xl text-chm-black mb-2">Staff Records</h1>
        <p className="text-gray-600">All onboarded candidates and their information</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Search by Name, Email or Phone
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Jane Smith or jane@example.com"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Filter by Position
            </label>
            <select
              value={filterPosition}
              onChange={e => setFilterPosition(e.target.value)}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="">All Positions</option>
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportCSV}
              className="w-full bg-chm-red text-white px-4 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors rounded"
            >
              Export CSV
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filteredRecords.length} of {records.length} records
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Name</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Email</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Phone</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Position</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Experience</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">DOB</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Sex</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">1099</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Status</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">No-Shows</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(record => (
              <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-chm-black">{record.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.position}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.years_of_experience} yrs</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(record.date_of_birth).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.sex}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    record.acknowledged_1099
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {record.acknowledged_1099 ? '✓ Yes' : '✗ No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    record.onboarding_status === 'profile_submitted'
                      ? 'bg-blue-100 text-blue-700'
                      : record.onboarding_status === 'orientation_completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {record.onboarding_status === 'profile_submitted' ? 'Profile Submitted' :
                     record.onboarding_status === 'orientation_completed' ? 'Orientation Done' :
                     'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`font-bold ${(record.no_show_count || 0) >= 2 ? 'text-red-600' : 'text-gray-600'}`}>
                    {record.no_show_count || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(record.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No staff records found</p>
        </div>
      )}
    </div>
  )
}
