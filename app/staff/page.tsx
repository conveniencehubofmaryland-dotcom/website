'use client'

import { Suspense } from 'react'
import StaffPageContent from './staff-page-content'

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>}>
      <StaffPageContent />
    </Suspense>
  )
}
