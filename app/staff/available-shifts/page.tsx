'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AvailableShiftsPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [staffName, setStaffName] = useState('')
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    async function checkAuthorization() {
      try {
        const urlToken = searchParams.get('token')
        let applicantId = localStorage.getItem('applicant_id')

        if (!applicantId && urlToken) {
          // Verify token and get applicant_id
          const res = await fetch(`/api/staff/claim-shift/verify-token?token=${urlToken}`)
          if (res.ok) {
            const data = await res.json()
            applicantId = data.applicant_id
            localStorage.setItem('applicant_id', applicantId)
            localStorage.setItem('claim_shift_token', urlToken)
          }
        }

        if (!applicantId) {
          setAuthorized(false)
          setLoading(false)
          return
        }

        // Check onboarding status
        const res = await fetch(`/api/staff/welcome/check?applicant_id=${applicantId}`)
        if (res.ok) {
          const data = await res.json()
          setStaffName(data.staffName)

          if (data.onboarding_status === 'ready_to_claim_shifts') {
            setAuthorized(true)
          } else {
            setAuthorized(false)
          }
        } else {
          setAuthorized(false)
        }
      } catch (err) {
        console.error('Authorization check error:', err)
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 shadow-sm rounded text-center">
            <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
            <h1 className="font-serif text-2xl text-chm-black mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">
              You haven't completed your onboarding yet. Please return to your email for the claim shift link or start the process from the beginning.
            </p>
            <div className="space-y-2">
              <Link href="/staff" className="inline-block bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700">
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">Available Shifts</h1>
          <p className="text-sm text-gray-500">Welcome, {staffName}! Browse and claim shifts below.</p>
        </div>

        <div className="bg-white p-8 shadow-sm rounded">
          <p className="text-gray-600">Shift management coming soon.</p>
        </div>
      </div>
    </div>
  )
}
