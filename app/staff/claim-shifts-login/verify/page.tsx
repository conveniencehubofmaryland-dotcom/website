'use client'
import { Suspense } from 'react'
import VerifyContent from './content'

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
