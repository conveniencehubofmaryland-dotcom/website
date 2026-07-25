'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function HowItWorksContent() {
  const searchParams = useSearchParams()
  const position = searchParams.get('position') ? decodeURIComponent(searchParams.get('position')!) : null
  const applicantId = searchParams.get('applicant_id') || null

  if (!position || !applicantId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-8 text-center">
            <h1 className="font-serif text-2xl text-red-700 mb-4">Invalid Onboarding Link</h1>
            <p className="text-red-600 mb-6">Please start your onboarding from the beginning.</p>
            <a href="/welcome-center" className="inline-block bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
              Start Over
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Getting Started</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black">How CHM Works for Staff</h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed font-light">
            Everything you need to know to start working with Convenience Hub of Maryland &mdash; from day one.
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
        <div className="mb-8 bg-chm-red/10 border border-chm-red/20 rounded p-4">
          <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">Your Position (Locked)</p>
          <p className="text-lg font-semibold text-chm-black">{position}</p>
          <p className="text-xs text-gray-500 mt-2">This position cannot be changed during onboarding. If this is incorrect, you&apos;ll need to start over.</p>
        </div>
        <div className="space-y-16">
          {/* Rest of page content here */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <Link href={`/staff/orientation?position=${encodeURIComponent(position)}&applicant_id=${applicantId}`} className="block">
              <p className="font-serif text-xl text-chm-black mb-2">Ready? Go to Orientation</p>
              <p className="text-sm text-gray-700">Review and sign the orientation agreement.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffHowItWorksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p>Loading...</p></div>}>
      <HowItWorksContent />
    </Suspense>
  )
}
