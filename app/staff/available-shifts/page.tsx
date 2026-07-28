'use client'
import { Suspense } from 'react'
import AvailableShiftsContent from './content'

export default function AvailableShiftsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AvailableShiftsContent />
    </Suspense>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )
}
