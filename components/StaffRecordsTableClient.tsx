'use client'
import { useState } from 'react'
import CreateStaffModal from './CreateStaffModal'
import EditStaffModal from './EditStaffModal'
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
  notes?: string | null
  own_car?: boolean
  background_check_url?: string | null
}
const POSITIONS = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary/Chef',
  'Nanny/Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]
export default function StaffRecordsTableClient({ initialRecords }: { initialRecords: StaffRecord[] }) {
  const [records, setRecords] = useState<StaffRecord[]>(initialRecords)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPosition, setFilterPosition] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState<StaffRecord | null>(null)
  const [activeTab, setActiveTab] = useState<'records' | 'documents'>('records')

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm)
    const matchesPosition = !filterPosition || record.position === filterPosition
    return matchesSearch && matchesPosition
  })

  const handleCreateSuccess = (newRecord: StaffRecord) => {
    setRecords([newRecord, ...records])
    setShowCreateModal(false)
  }

  const handleEditClick = (record: StaffRecord) => {
    setEditingRecord(record)
    setShowEditModal(true)
  }

  const handleEditSuccess = (updatedRecord: StaffRecord) => {
    setRecords(records.map(r => r.id === updatedRecord.id ? updatedRecord : r))
    setShowEditModal(false)
    setEditingRecord(null)
  }

  const handleDeleteClick = async (recordId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      return
    }
    try {
      const res = await fetch(`/api/admin/staff/${recordId}`, { method: 'DELETE' })
      if (res.ok) {
        setRecords(records.filter(r => r.id !== recordId))
      } else {
        alert('Failed to delete staff record')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting staff record')
    }
  }

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
      'Own Car',
      'Background Check',
      'Notes',
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
      r.own_car ? 'Yes' : 'No',
      r.background_check_url ? 'Uploaded' : 'Not Provided',
      r.notes || '',
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

  const handleShareBackgroundCheck = async (email: string, url: string) => {
    if (!url) return
    try {
      const res = await fetch('/api/admin/staff-documents/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          documentUrl: url,
          documentName: 'Background Check',
        }),
      })
      if (res.ok) {
        alert(`Background check link sent to ${email}`)
      } else {
        alert('Failed to share document')
      }
    } catch (err) {
      console.error('Share error:', err)
      alert('Error sharing document')
    }
  }

  const handleDeleteBackgroundCheck = async (recordId: string) => {
    if (!confirm('Delete this background check?')) return
    try {
      const res = await fetch('/api/admin/staff-documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId, type: 'background_check' }),
      })
      if (res.ok) {
        setRecords(records.map(r => 
          r.id === recordId ? { ...r, background_check_url: null } : r
        ))
      } else {
        alert('Failed to delete document')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting document')
    }
  }

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-3 font-semibold text-sm uppercase tracking-widest transition-colors ${
              activeTab === 'records'
                ? 'text-chm-red border-b-2 border-chm-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Staff Records
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 font-semibold text-sm uppercase tracking-widest transition-colors ${
              activeTab === 'documents'
                ? 'text-chm-red border-b-2 border-chm-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Documents & Info
          </button>
        </div>
      </div>

      {/* RECORDS TAB */}
      {activeTab === 'records' && (
        <>
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
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex-1 bg-chm-red text-white px-4 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors rounded"
                >
                  + Create New
                </button>
                <button
                  onClick={exportCSV}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors rounded"
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
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Phone
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Position
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Experience
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    DOB
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Sex
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    1099
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    No-Shows
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Joined
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Actions
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Own Car</th>

                  // In table rows:
                <td className="px-4 py-3">
                  {record.own_car ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    ✓ Yes
                  </span>
               ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                    ✗ No
                   </span>
                 )}
                </td>  
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.acknowledged_1099
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {record.acknowledged_1099 ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.onboarding_status === 'profile_submitted'
                            ? 'bg-blue-100 text-blue-700'
                            : record.onboarding_status === 'orientation_completed'
                            ? 'bg-green-100 text-green-700'
                            : record.onboarding_status === 'ready_to_claim_shifts'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {record.onboarding_status === 'profile_submitted'
                          ? 'Profile Submitted'
                          : record.onboarding_status === 'orientation_completed'
                          ? 'Orientation Done'
                          : record.onboarding_status === 'ready_to_claim_shifts'
                          ? 'Ready to Claim'
                          : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`font-bold ${
                          (record.no_show_count || 0) >= 2 ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {record.no_show_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(record.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(record.id, record.full_name)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
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
        </>
      )}

      {/* DOCUMENTS & INFO TAB */}
      {activeTab === 'documents' && (
        <>
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Search by Name or Email
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Jane Smith or jane@example.com"
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={exportCSV}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors rounded"
                >
                  Export CSV
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Showing {filteredRecords.length} of {records.length} records
            </p>
          </div>

          {/* Documents Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Own Car
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Background Check
                  </th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-chm-black">{record.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.own_car
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {record.own_car ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {record.background_check_url ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          ✓ Uploaded
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {record.background_check_url && (
                          <>
                            <a
                              href={record.background_check_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200 transition-colors"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleShareBackgroundCheck(record.email, record.background_check_url!)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200 transition-colors"
                            >
                              Share
                            </button>
                            <button
                              onClick={() => handleDeleteBackgroundCheck(record.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
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
        </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateStaffModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
      {showEditModal && editingRecord && (
        <EditStaffModal
          record={editingRecord}
          onClose={() => {
            setShowEditModal(false)
            setEditingRecord(null)
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
