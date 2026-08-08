'use client'
import { useState, useEffect } from 'react'
import CreateStaffModal from './CreateStaffModal'
import EditStaffModal from './EditStaffModal'
import DocumentEditModal from './DocumentEditModal'

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

interface StaffDocument {
  id: string
  staffId: string
  staffName: string
  staffEmail: string
  documentType: 'orientation' | 'offer_letter' | 'certification' | 'background_check' | 'training_cert' | 'direct_deposit'
  documentName: string
  dateSigned: string | null
  documentUrl: string | null
  status: string
  ownCar: boolean | null
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
  const [documents, setDocuments] = useState<StaffDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<StaffDocument | null>(null)
  const [docsSearchTerm, setDocsSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phone.includes(searchTerm)
    const matchesPosition = !filterPosition || record.position === filterPosition
    return matchesSearch && matchesPosition
  })

  useEffect(() => {
    if (activeTab === 'documents' && documents.length === 0) {
      fetchDocuments()
    }
  }, [activeTab])

  const fetchDocuments = async () => {
    setDocsLoading(true)
    try {
      const res = await fetch('/api/admin/staff-documents')
      if (!res.ok) throw new Error('Failed to fetch documents')
      const data = await res.json()
      setDocuments(data)
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setDocsLoading(false)
    }
  }

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

  const handleDocumentDelete = async (documentId: string, type: string) => {
    if (!confirm('Delete this document?')) return
    try {
      const res = await fetch('/api/admin/staff-documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: documentId, type }),
      })
      if (!res.ok) throw new Error('Failed to delete document')
      setDocuments(prev => prev.filter(d => d.id !== documentId))
    } catch (err) {
      console.error('Error deleting document:', err)
      alert('Failed to delete document')
    }
  }

  const handleDocumentShare = async (email: string, documentUrl: string, documentName: string) => {
    if (!documentUrl) {
      alert('No file to share')
      return
    }
    try {
      const res = await fetch('/api/admin/staff-documents/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, documentUrl, documentName }),
      })
      if (!res.ok) throw new Error('Failed to share document')
      alert('Document link sent to staff member')
    } catch (err) {
      console.error('Error sharing document:', err)
      alert('Failed to share document')
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">✓ Signed</span>
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">✓ Completed</span>
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">✓ Approved</span>
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">✗ Rejected</span>
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">⏳ Pending</span>
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">{status}</span>
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'background_check':
        return 'Background Check'
      case 'training_cert':
        return 'Training Certificate'
      case 'certification':
        return 'Training Certificate'
      case 'orientation':
        return 'Orientation/MOU'
      case 'offer_letter':
        return 'Offer Letter'
      case 'direct_deposit':
        return 'Direct Deposit Form'
      default:
        return type
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.staffName.toLowerCase().includes(docsSearchTerm.toLowerCase()) ||
                         doc.staffEmail.toLowerCase().includes(docsSearchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.documentType === filterType || 
                        (filterType === 'certification' && (doc.documentType === 'certification' || doc.documentType === 'training_cert'))
    return matchesSearch && matchesType
  })

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

      {/* STAFF RECORDS TAB */}
      {activeTab === 'records' && (
        <>
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
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Own Car</th>
                  <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">Actions</th>
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
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(record.date_of_birth).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.sex}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${record.acknowledged_1099 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {record.acknowledged_1099 ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${record.onboarding_status === 'profile_submitted' ? 'bg-blue-100 text-blue-700' : record.onboarding_status === 'orientation_completed' ? 'bg-green-100 text-green-700' : record.onboarding_status === 'ready_to_claim_shifts' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {record.onboarding_status === 'profile_submitted' ? 'Profile Submitted' : record.onboarding_status === 'orientation_completed' ? 'Orientation Done' : record.onboarding_status === 'ready_to_claim_shifts' ? 'Ready to Claim' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm"><span className={`font-bold ${(record.no_show_count || 0) >= 2 ? 'text-red-600' : 'text-gray-600'}`}>{record.no_show_count || 0}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(record.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${record.own_car ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {record.own_car ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditClick(record)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200 transition-colors">Edit</button>
                        <button onClick={() => handleDeleteClick(record.id, record.full_name)} className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRecords.length === 0 && <div className="text-center py-12"><p className="text-gray-500">No staff records found</p></div>}
        </>
      )}

      {/* DOCUMENTS & INFO TAB */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Search by name or email…"
              value={docsSearchTerm}
              onChange={(e) => setDocsSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="all">All Document Types</option>
              <option value="background_check">Background Checks</option>
              <option value="certification">Training Certificates</option>
              <option value="orientation">Orientation/MOU</option>
              <option value="offer_letter">Offer Letters</option>
              <option value="direct_deposit">Direct Deposit Forms</option>
            </select>
          </div>

          {docsLoading ? (
            <div className="flex justify-center py-8"><p className="text-gray-600">Loading documents…</p></div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No documents found</div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Staff Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Document Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">File</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{doc.staffName}</p>
                          <p className="text-xs text-gray-500">{doc.staffEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-gray-700">{getDocumentTypeLabel(doc.documentType)}</span></td>
                      <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                      <td className="px-4 py-3">
                        {doc.documentUrl ? (
                          <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="text-chm-red hover:underline text-xs font-semibold">View File</a>
                        ) : (
                          <span className="text-gray-400 text-xs">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {doc.documentUrl && (
                            <>
                              <button onClick={() => handleDocumentShare(doc.staffEmail, doc.documentUrl!, doc.documentName)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold hover:bg-blue-200 transition">Share</button>
                              <button onClick={() => window.open(doc.documentUrl, '_blank')} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold hover:bg-purple-200 transition">Print</button>
                            </>
                          )}
                          <button onClick={() => handleDocumentDelete(doc.id, doc.documentType)} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCreateModal && <CreateStaffModal onClose={() => setShowCreateModal(false)} onSuccess={handleCreateSuccess} />}
      {showEditModal && editingRecord && <EditStaffModal record={editingRecord} onClose={() => { setShowEditModal(false); setEditingRecord(null) }} onSuccess={handleEditSuccess} />}
      {selectedDocument && <DocumentEditModal document={selectedDocument} onClose={() => setSelectedDocument(null)} onSuccess={(updated) => { setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d)); setSelectedDocument(null) }} />}
    </div>
  )
}
