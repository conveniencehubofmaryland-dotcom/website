'use client'

import { useState } from 'react'

interface StaffDocument {
  id: string
  staffName: string
  staffEmail: string
  documentType: 'orientation' | 'offer_letter' | 'certification' | 'background_check'
  documentName: string
  dateSigned: string | null
  documentUrl: string | null
  status: string
  ownCar: boolean | null
}

interface StaffDocumentsSectionProps {
  documents: StaffDocument[]
  onDelete: (id: string, type: string) => Promise<void>
  onShare: (email: string, documentUrl: string, documentName: string) => Promise<void>
}

export default function StaffDocumentsSection({
  documents,
  onDelete,
  onShare,
}: StaffDocumentsSectionProps) {
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedDocument, setSelectedDocument] = useState<StaffDocument | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.documentType === filter
    const matchesSearch =
      doc.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.staffEmail.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleDelete = async (doc: StaffDocument) => {
    if (!window.confirm(`Delete ${doc.documentName}?`)) return
    setLoading(true)
    try {
      await onDelete(doc.id, doc.documentType)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (doc: StaffDocument) => {
    if (!doc.documentUrl) return
    setLoading(true)
    try {
      await onShare(doc.staffEmail, doc.documentUrl, doc.documentName)
      alert('Document share link sent to ' + doc.staffEmail)
    } finally {
      setLoading(false)
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'orientation':
        return 'Orientation/MOU'
      case 'offer_letter':
        return 'Offer Letter'
      case 'certification':
        return 'Training Certification'
      case 'background_check':
        return 'Background Check'
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    const classes = 'px-2 py-1 rounded text-xs font-semibold'
    switch (status) {
      case 'signed':
        return `${classes} bg-green-100 text-green-800`
      case 'pending':
        return `${classes} bg-yellow-100 text-yellow-800`
      case 'completed':
        return `${classes} bg-blue-100 text-blue-800`
      default:
        return `${classes} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-chm-dark">Staff Documents</h2>
        <p className="text-gray-600">View signed documents, certifications, and background checks</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chm-red"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chm-red"
        >
          <option value="all">All Documents</option>
          <option value="orientation">Orientations/MOUs</option>
          <option value="offer_letter">Offer Letters</option>
          <option value="certification">Certifications</option>
          <option value="background_check">Background Checks</option>
        </select>
      </div>

      {/* Document List */}
      {filteredDocs.length === 0 ? (
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">No documents found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Staff Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Document Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Signed</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Own Car</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={`${doc.documentType}-${doc.id}`} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">{doc.staffName}</p>
                      <p className="text-sm text-gray-600">{doc.staffEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900">{getDocumentTypeLabel(doc.documentType)}</span>
                  </td>
                  <td className="py-3 px-4">
                    {doc.dateSigned ? (
                      <span className="text-gray-900">
                        {new Date(doc.dateSigned).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={getStatusBadge(doc.status)}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {doc.ownCar !== null ? (
                      <span className="text-gray-900">{doc.ownCar ? 'Yes' : 'No'}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-center">
                      {doc.documentUrl && (
                        <>
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition"
                            title="View/Download"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleShare(doc)}
                            disabled={loading}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition disabled:opacity-50"
                            title="Share document"
                          >
                            Share
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition disabled:opacity-50"
                        title="Delete"
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
      )}

      {/* Export CSV */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const csv = [
              ['Staff Name', 'Email', 'Document Type', 'Date Signed', 'Status', 'Own Car'],
              ...filteredDocs.map(d => [
                d.staffName,
                d.staffEmail,
                getDocumentTypeLabel(d.documentType),
                d.dateSigned ? new Date(d.dateSigned).toLocaleDateString() : '',
                d.status,
                d.ownCar !== null ? (d.ownCar ? 'Yes' : 'No') : '',
              ]),
            ]
              .map(row => row.map(cell => `"${cell}"`).join(','))
              .join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `staff-documents-${new Date().toISOString().split('T')[0]}.csv`
            a.click()
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
        >
          Export CSV
        </button>
      </div>
    </div>
  )
}
