'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function WelcomeCenterThankYouPage() {
  const searchParams = useSearchParams()
  const position = searchParams.get('position')
  const applicantId = searchParams.get('applicant_id')

  const [positionError, setPositionError] = useState('')

  useEffect(() => {
    // Validate position and applicant_id exist
    if (!position || !applicantId) {
      setPositionError('Invalid onboarding link. Please start from the beginning.')
    }
  }, [position, applicantId])

  if (positionError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-8 text-center">
            <h1 className="font-serif text-2xl text-red-700 mb-4">Invalid Link</h1>
            <p className="text-red-600 mb-6">{positionError}</p>
            <a href="/welcome-center" className="inline-block bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
              Start Over
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Position Badge — Confirmed */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded p-4">
          <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">Your Position (Confirmed)</p>
          <p className="text-lg font-semibold text-green-700">{position}</p>
        </div>

        <div className="mb-8 text-center">
          <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
          <h1 className="font-serif text-4xl text-chm-black mb-4">Welcome to CHM!</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Thank you for completing your orientation. We are excited to have you join the Convenience Hub of Maryland team.
          </p>
        </div>

        <div className="bg-white p-8 shadow-sm mb-8 border border-gray-200">
          <h2 className="font-semibold text-chm-black text-lg mb-6">What Happens Next:</h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-chm-red text-white rounded-full flex items-center justify-center font-semibold text-sm">1</span>
              <div>
                <p className="font-semibold text-chm-black mb-1">Complete Required Training Modules</p>
                <p className="text-sm text-gray-600">You will now access your training modules. These are mandatory and must be completed with a score of 80% or higher before you can work your first shift.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-chm-red text-white rounded-full flex items-center justify-center font-semibold text-sm">2</span>
              <div>
                <p className="font-semibold text-chm-black mb-1">Our HR Team Will Contact You</p>
                <p className="text-sm text-gray-600">Our HR team will reach out to you within 1-2 business days to complete the rest of your onboarding process, collect necessary forms (W-4, I-9, direct deposit), and answer any questions.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-chm-red text-white rounded-full flex items-center justify-center font-semibold text-sm">3</span>
              <div>
                <p className="font-semibold text-chm-black mb-1">Claim Your First Shift</p>
                <p className="text-sm text-gray-600">Once training is complete, you can browse and claim shifts from the available shifts portal. Start whenever you&apos;re ready!</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-8">
          <p className="text-sm text-blue-900 mb-4">
            <strong>Next Step:</strong> Click below to start your required training modules. This is mandatory before you can work.
          </p>
          <Link href={`/staff/training-modules?position=${encodeURIComponent(position!)}&applicant_id=${applicantId}`} className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
            Start Training Modules
          </Link>
        </div>

        <div className="bg-gray-50 p-6 rounded border border-gray-200">
          <h3 className="font-semibold text-chm-black mb-4">Questions or Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our HR team is here to support you. Reach out anytime:
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Email:</strong> conveniencehubofmaryland@gmail.com</p>
            <p><strong>Phone:</strong> 202-579-2944</p>
            <p><strong>Hours:</strong> Monday–Saturday, 9 AM–9 PM</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Your position ({position}) is locked throughout the onboarding process.
        </p>
      </div>
    </div>
  )
}
