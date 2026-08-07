'use client'
import { useState } from 'react'

interface StaffDocument {
  id: string
  staffId: string
  staffName: string
  staffEmail: string
  documentType: 'background_check' | 'training_cert' | 'orientation' | 'offer_letter' | 'direct_deposit'
  documentName: string
  documentUrl: string | null
  status: 'pending' | 'approved' | 'rejected'
  notes: string | null
}

interface DocumentEditModalProps {
  document: StaffDocument
  onClose: () => void
  onSuccess: (document: StaffDocument) => void
}

export default function DocumentEditModal({ document, onClose, onSuccess }: DocumentEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    status: document.status,
    notes: document.notes || '',
  })

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.value as any }))
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, notes: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append('id', document.id)
      formDataObj.append('status', formData.status)
      formDataObj.append('notes', formData.notes)
      if (file) {
        formDataObj.append('document', file)
      }

      const res = await fetch(`/api/admin/staff-documents/${document.id}`, {
        method: 'PUT',
        body: formDataObj,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update document')
      }

      const updatedDocument = await res.json()
      onSuccess(updatedDocument)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (document.documentUrl) {
      window.open(document.documentUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif text-chm-black">Edit {document.documentName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
            <p><strong>Staff:</strong> {document.staffName} ({document.staffEmail})</p>
            <p><strong>Document Type:</strong> {document.documentName}</p>
            {document.documentUrl && (
              <p><strong>Current File:</strong> <a href={document.documentUrl} target="_blank" rel="noopener noreferrer" className="text-chm-red hover:underline">View Document</a></p>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={handleStatusChange}
              className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={handleNotesChange}
              rows={4}
              placeholder="Add notes about this document (e.g., reason for rejection, requested changes)"
              className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Re-upload Document (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
            />
            {file && <p className="text-xs text-green-600 mt-1">✓ {file.name}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 px-4 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors rounded"
            >
              Cancel
            </button>
            {document.documentUrl && (
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 border border-gray-200 text-chm-red px-4 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-50 transition-colors rounded"
              >
                Print
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-chm-red text-white px-4 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-colors rounded"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
