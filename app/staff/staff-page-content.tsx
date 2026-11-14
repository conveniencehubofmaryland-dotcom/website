'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function StaffPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite_token')
  
  const [staffName, setStaffName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        // Old invite links: send the applicant through How It Works with the same token.
        if (inviteToken) {
          router.replace(`/staff/how-it-works?invite_token=${encodeURIComponent(inviteToken)}`)
          return
        }

        // The staff portal requires the emailed sign-in code.
        const token = typeof window !== 'undefined' ? localStorage.getItem('staff_session_token') : null
        if (!token) {
          router.replace('/staff/claim-shifts-login')
          return
        }
        const res = await fetch(`/api/staff/login/check?token=${encodeURIComponent(token)}`)
        if (!res.ok) {
          localStorage.removeItem('staff_session_token')
          localStorage.removeItem('staff_email')
          router.replace('/staff/claim-shifts-login')
          return
        }
        const data = await res.json()
        setStaffName(data.full_name ? String(data.full_name).split(' ')[0] : 'Staff Member')
      } catch (err) {
        console.error('Auth check failed:', err)
        router.replace('/staff/claim-shifts-login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, inviteToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-2">Welcome</p>
          <h1 className="font-serif text-4xl md:text-5xl text-chm-black">Hello, {staffName}</h1>
          <div className="w-8 h-px bg-chm-red mt-4" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 hover:bg-blue-100 transition-colors">
          <Link href="/staff/how-it-works" className="block">
            <p className="font-serif text-xl text-chm-black mb-2">New to CHM? Start Here</p>
            <p className="text-sm text-gray-700">Learn how our platform works in 5 steps — onboarding, training, shifts, certifications, and support.</p>
          </Link>
        </div>

        <div className="space-y-6">
          <Link href="/staff/welcome" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-chm-red transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Onboarding</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Complete your profile, review CHM&apos;s orientation, and gain access to training modules.</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </Link>

          <Link href="/staff/training-modules" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-chm-red transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Training Modules</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Complete required training, take the quiz, and earn your CHM certification.</p>
              </div>
              <span className="text-2xl">📚</span>
            </div>
          </Link>

          <Link href="/staff/available-shifts" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-chm-red transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Available Shifts</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Browse and claim shifts that work for your schedule.</p>
              </div>
              <span className="text-2xl">📅</span>
            </div>
          </Link>

          <Link href="/staff/support" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-chm-red transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Support</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Need help? Contact our HR team for assistance with any questions.</p>
              </div>
              <span className="text-2xl">💬</span>
            </div>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Questions? Visit the <Link href="/staff/how-it-works" className="text-chm-red hover:underline">How It Works</Link> page or submit a support ticket.
          </p>
        </div>
      </div>
    </div>
  )
}
