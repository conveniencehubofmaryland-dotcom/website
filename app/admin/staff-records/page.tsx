'use client'
import { useEffect, useState } from 'react'
import StaffRecordsTableClient from '@/components/StaffRecordsTableClient'

export default function StaffRecordsPage() {
  const [activeTab, setActiveTab] = useState<'records' | 'documents'>('records')

  return (
    <div className="space-y-8">
      <div>
        <div className="w-12 h-px bg-chm-red mb-4" />
        <h1 className="font-serif text-4xl text-chm-black mb-2">Staff Records</h1>
        <p className="text-gray-600">Manage all onboarded candidates and their information</p>
      </div>

      <StaffRecordsTableClient />
    </div>
  )
}
