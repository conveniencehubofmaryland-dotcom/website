'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function TrainingThankYouPage() {
  const params = useParams()
  const moduleId = params.id as string

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 shadow-sm text-center">
          <div className="w-12 h-px bg-chm-red mx-auto mb-8" />
          
          <div className="mb-8">
            <div className="text-6xl mb-6">✓</div>
            <h1 className="font-serif text-4xl text-chm-black mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600">
              You have successfully completed this training module and earned your certification.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 text-sm leading-relaxed">
              Your certification has been saved to your profile. You are now eligible to claim shifts in this role. Continue building your skills by completing additional training modules to advance your career with Convenience Hub of Maryland.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/staff/training-modules"
              className="inline-block bg-chm-red text-white px-8 py-4 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              View All Modules
            </Link>
            <div className="pt-3">
              <Link
                href="/staff/available-shifts"
                className="text-chm-red font-semibold text-sm hover:underline"
              >
                Browse Available Shifts →
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2">Need help?</p>
            <p className="text-gray-600 text-sm">
              202-579-2944 • Mon–Sat, 9 AM–9 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
