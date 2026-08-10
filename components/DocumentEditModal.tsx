'use client'
import { useState } from 'react'

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
  notes?: string | null
}

interface DocumentEditModalProps {
  document: StaffDocument
  onClose: () => void
  onSuccess: (document: StaffDocument) => void
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'background_check': 'Background Check',
  'training_cert': 'Training Certificate',
  'certification': 'Certification',
  'orientation': 'Orientation/MOU',
  'offer_letter': 'Offer Letter',
  'direct_deposit': 'Direct Deposit Form',
}

export default function DocumentEditModal({ document, onClose, onSuccess }: DocumentEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    status: document.status || 'pending',
    notes: document.notes || '',
  })

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.value }))
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
    setLoading(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('status', formData.status)
      formDataToSend.append('notes', formData.notes)
      if (file) {
        formDataToSend.append('file', file)
      }

      const res = await fetch(`/api/admin/staff-documents/${document.id}`, {
        method: 'PUT',
        body: formDataToSend,
      })

      if (!res.ok) {
        throw new Error('Failed to update document')
      }

      const updated = await res.json()
      onSuccess(updated)
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
          <h2 className="text-2xl font-bold text-chm-black mb-1">Edit Document</h2>
          <p className="text-sm text-gray-600">{document.documentName}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Staff Name
            </label>
            <input
              type="text"
              value={document.staffName}
              disabled
              className="w-full border border-gray-200 px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Document Type
            </label>
            <input
              type="text"
              value={DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}
              disabled
              className="w-full border border-gray-200 px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded"
            />
          </div>

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
              <option value="signed">Signed</option>
              <option value="completed">Completed</option>
              <option value="uploaded">Uploaded</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={handleNotesChange}
              placeholder="Add any notes about this document…"
              className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded h-24"
            />
          </div>

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
            {document.documentUrl && !file && (
              <p className="text-sm text-gray-500 mt-1">Current file: {document.documentName}</p>
            )}
          </div>

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
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
