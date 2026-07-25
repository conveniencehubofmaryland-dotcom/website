'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function TrainingThankYouPage() {
  const [applicantId, setApplicantId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function markTrainingComplete() {
      try {
        let id = localStorage.getItem('applicant_id')
        if (!id) {
          const cookies = document.cookie.split(';')
          const applCookie = cookies.find(c => c.trim().startsWith('applicant_id='))
          id = applCookie ? applCookie.split('=')[1] : null
        }

        if (id) {
          setApplicantId(id)
          // Note: Training completion doesn't change status yet
          // Offer signing will set status to 'offer_signed'
          // HR paperwork completion will set to 'ready_to_claim_shifts'
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    markTrainingComplete()
  }, [])

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 shadow-sm rounded text-center">
          <div className="w-12 h-px bg-chm-red mx-auto mb-8" />
          
          <div className="mb-8">
            <div className="text-6xl mb-6">✓</div>
            <h1 className="font-serif text-4xl text-chm-black mb-4">Training Complete!</h1>
            <p className="text-lg text-gray-600">
              You have successfully completed this training module and earned your certification.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 text-sm leading-relaxed">
              Your certification has been saved to your profile. You are now eligible to work in this role. Continue building your skills by completing additional training modules to advance your career with Convenience Hub of Maryland.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-serif text-xl text-chm-black mb-4">Next Steps</h2>
            <div className="text-left space-y-3">
              <div className="flex gap-3">
                <span className="text-chm-red font-bold min-w-fit">1.</span>
                <p className="text-sm text-gray-700"><strong>Offer Letter Coming Soon</strong> — Our HR team will send you an official offer letter within 1-2 business days with your position details, compensation, and start date. Check your email for the link to review and sign.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-chm-red font-bold min-w-fit">2.</span>
                <p className="text-sm text-gray-700"><strong>Complete Onboarding Documents</strong> — HR will contact you to collect W-4, I-9 verification, direct deposit setup, and any certifications. This typically takes 1-2 business days.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-chm-red font-bold min-w-fit">3.</span>
                <p className="text-sm text-gray-700"><strong>Ready to Claim Shifts</strong> — Once you've signed the offer and HR completes your paperwork, you'll be able to browse and claim shifts on the platform.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <Link
              href="/staff/training-modules"
              className="inline-block bg-chm-red text-white px-8 py-4 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              View All Modules
            </Link>
            <div className="pt-3">
              <Link
                href="/staff"
                className="text-chm-red font-semibold text-sm hover:underline"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-3">Need help?</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Email:</strong> conveniencehubofmaryland@gmail.com</p>
              <p><strong>Phone:</strong> 202-579-2944 (Mon–Sat, 9 AM–9 PM)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
