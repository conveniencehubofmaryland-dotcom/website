'use client'

import { useEffect, useState } from 'react'
import StaffRecordsTableClient from '@/components/StaffRecordsTableClient'
import StaffDocumentsSection from '@/components/StaffDocumentsSection'
import AdminNav from '@/components/AdminNav'
import { useRouter } from 'next/navigation'

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

export default function StaffRecordsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'records' | 'documents'>('records')
  const [documents, setDocuments] = useState<StaffDocument[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments()
    }
  }, [activeTab])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/staff-documents')
      if (!res.ok) throw new Error('Failed to fetch documents')
      const data = await res.json()
      setDocuments(data)
    } catch (err) {
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (id: string, type: string) => {
    try {
      const res = await fetch('/api/admin/staff-documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type }),
      })
      if (!res.ok) throw new Error('Failed to delete document')
      
      setDocuments(prev => prev.filter(d => !(d.id === id && d.documentType === type)))
    } catch (err) {
      console.error('Error deleting document:', err)
      alert('Failed to delete document')
    }
  }

  const handleShareDocument = async (email: string, documentUrl: string, documentName: string) => {
    try {
      const res = await fetch('/api/admin/staff-documents/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, documentUrl, documentName }),
      })
      if (!res.ok) throw new Error('Failed to share document')
    } catch (err) {
      console.error('Error sharing document:', err)
      alert('Failed to share document')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="max-w-7xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-chm-dark mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage staff records and view signed documents</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'records'
                ? 'text-chm-red border-b-2 border-chm-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Staff Records
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'documents'
                ? 'text-chm-red border-b-2 border-chm-red'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Documents
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {activeTab === 'records' && <StaffRecordsTableClient />}
          {activeTab === 'documents' && (
            loading ? (
              <div className="flex justify-center py-8">
                <p className="text-gray-600">Loading documents...</p>
              </div>
            ) : (
              <StaffDocumentsSection
                documents={documents}
                onDelete={handleDeleteDocument}
                onShare={handleShareDocument}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}
