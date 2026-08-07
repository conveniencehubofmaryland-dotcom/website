'use client'
import { useState } from 'react'
import StaffRecordsTableClient from '@/components/StaffRecordsTableClient'
import StaffDocumentsTab from '@/components/StaffDocumentsTab'

export default function StaffRecordsPage() {
  const [activeTab, setActiveTab] = useState<'records' | 'documents'>('records')

  return (
    <div className="space-y-8">
      <div>
        <div className="w-12 h-px bg-chm-red mb-4" />
        <h1 className="font-serif text-4xl text-chm-black mb-2">Staff Records</h1>
        <p className="text-gray-600">Manage all onboarded candidates and their information</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
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
          Documents & Info
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-8">
        {activeTab === 'records' && <StaffRecordsTableClient />}
        {activeTab === 'documents' && <StaffDocumentsTab records={[]} />}
      </div>
    </div>
  )
}
