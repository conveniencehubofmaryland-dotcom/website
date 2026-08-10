'use client'
import { useState, useEffect } from 'react'

interface StaffRecord {
  id: string
  full_name: string
  email: string
}

interface CreateDocumentModalProps {
  staffRecords: StaffRecord[]
  onClose: () => void
  onSuccess: () => void
}

const DOCUMENT_TYPES = [
  const DOCUMENT_TYPES = [
  { value: 'background_check', label: 'Background Check' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'certification', label: 'Certification' },
  { value: 'cpr_certification', label: 'CPR Certification' },
  { value: 'first_aid_certification', label: 'First Aid Certification' },
  { value: 'training_cert', label: 'Training Certificate' },
  { value: 'direct_deposit', label: 'Direct Deposit Form' },
  { value: 'other', label: 'Other (specify below)' },
]

export default function CreateDocumentModal({ staffRecords, onClose, onSuccess }: CreateDocumentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const [formData, setFormData] = useState({
    staffId: '',
    staffName: '',
    documentType: '',
    customDocumentType: '',
    status: 'pending',
    notes: '',
  })

  const filteredStaff = staffRecords.filter(s =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectStaff = (staff: StaffRecord) => {
    setFormData(prev => ({
      ...prev,
      staffId: staff.id,
      staffName: staff.full_name,
    }))
    setSearchTerm('')
    setShowDropdown(false)
  }

  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      documentType: e.target.value,
      customDocumentType: '',
    }))
  }

  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      customDocumentType: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.value }))
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.staffId) {
        throw new Error('Please select a staff member')
      }
      if (!formData.documentType) {
        throw new Error('Please select a document type')
      }
      if (formData.documentType === 'other' && !formData.customDocumentType) {
        throw new Error('Please specify the custom document type')
      }
      if (!file) {
        throw new Error('Please upload a file')
      }

      const formDataToSend = new FormData()
      formDataToSend.append('staffId', formData.staffId)
      formDataToSend.append('documentType', formData.documentType === 'other' ? formData.customDocumentType : formData.documentType)
      formDataToSend.append('file', file)
      formDataToSend.append('notes', formData.notes)

      const res = await fetch('/api/admin/staff-documents', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!res.ok) {
        throw new Error('Failed to create document')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-chm-black mb-1">Create New Document</h2>
          <p className="text-sm text-gray-600">Upload a document for a staff member</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Staff Member Search */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Staff Member
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm || formData.staffName}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by name or email…"
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              />
              {showDropdown && searchTerm && (
                <div className="absolute top-full left-0 right-0 border border-gray-200 bg-white rounded mt-1 max-h-48 overflow-y-auto z-10">
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map(staff => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => handleSelectStaff(staff)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{staff.full_name}</p>
                        <p className="text-xs text-gray-500">{staff.email}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No staff found</div>
                  )}
                </div>
              )}
            </div>
            {formData.staffName && (
              <p className="text-sm text-green-600 mt-1">✓ {formData.staffName}</p>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Document Type
            </label>
            <select
              value={formData.documentType}
              onChange={handleDocumentTypeChange}
              className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="">Select document type</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Document Type (if "Other" selected) */}
          {formData.documentType === 'other' && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Specify Document Type
              </label>
              <input
                type="text"
                value={formData.customDocumentType}
                onChange={handleCustomTypeChange}
                placeholder="e.g., Medical Certificate, Driver License"
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              />
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-200 px-4 py-2 text-sm rounded"
            />
            {file && <p className="text-sm text-green-600 mt-1">✓ {file.name}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={handleStatusChange}
              className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="uploaded">Uploaded</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder="Add any notes about this document…"
              className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded h-20"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-chm-red text-white rounded font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
