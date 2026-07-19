'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function StaffPortalPage() {
  const [applicantId, setApplicantId] = useState<string | null>(null)
  const [orientationComplete, setOrientationComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      try {
        const id = typeof window !== 'undefined' ? localStorage.getItem('applicant_id') : null
        setApplicantId(id)

        if (id) {
          const res = await fetch(`/api/staff/welcome/check?applicant_id=${id}`)
          const data = await res.json()
          setOrientationComplete(data.orientation_accepted || false)
        }
      } catch (err) {
        console.error('Error checking status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">Staff Portal</h1>
          <p className="text-sm text-gray-500">Welcome to your Convenience Hub of Maryland staff dashboard</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Onboarding Section */}
            <div className="bg-white border-2 border-chm-red p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl text-chm-black mb-1">Onboarding</h2>
                  <p className="text-sm text-gray-500">Get started with CHM</p>
                </div>
                {orientationComplete && (
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded">
                    Completed
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {orientationComplete
                    ? 'You have completed your orientation. You are ready to start your training and claim shifts.'
                    : 'Start your onboarding journey by completing your welcome orientation and reviewing our policies.'}
                </p>

                <Link
                  href="/staff/welcome"
                  className="inline-block bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors w-full text-center"
                >
                  {orientationComplete ? 'Review Welcome Info' : 'Start Welcome'}
                </Link>
              </div>
            </div>

            {/* Training Section */}
            <div className="bg-white border border-gray-200 p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl text-chm-black mb-1">Training Modules</h2>
                  <p className="text-sm text-gray-500">Build your skills</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Complete required training modules for your position to certify and become eligible for shifts.
                </p>

                <Link
                  href="/staff/training-modules"
                  className={`inline-block px-6 py-3 font-semibold text-xs uppercase tracking-widest w-full text-center transition-colors ${
                    orientationComplete
                      ? 'bg-chm-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={e => {
                    if (!orientationComplete) {
                      e.preventDefault()
                    }
                  }}
                >
                  {orientationComplete ? 'View Training' : 'Complete Orientation First'}
                </Link>
              </div>
            </div>

            {/* Available Shifts Section */}
            <div className="bg-white border border-gray-200 p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-serif text-2xl text-chm-black mb-1">Available Shifts</h2>
                  <p className="text-sm text-gray-500">Claim work</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Browse and claim available shifts in your area once you are certified.
                </p>

                <Link
                  href="/staff/available-shifts"
                  className={`inline-block px-6 py-3 font-semibold text-xs uppercase tracking-widest w-full text-center transition-colors ${
                    orientationComplete
                      ? 'bg-chm-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={e => {
                    if (!orientationComplete) {
                      e.preventDefault()
                    }
                  }}
                >
                  {orientationComplete ? 'View Shifts' : 'Complete Orientation First'}
                </Link>
              </div>
            </div>

            {/* Support Section */}
            <div className="bg-white border border-gray-200 p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="font-serif text-2xl text-chm-black mb-1">Support</h2>
                <p className="text-sm text-gray-500">Get help</p>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-gray-600">
                  Have questions? We are here to help!
                </p>
                <div>
                  <p className="font-semibold text-chm-black mb-1">Contact Us:</p>
                  <p className="text-gray-600">📞 202-579-2944</p>
                  <p className="text-gray-600">Mon–Sat, 9 AM–9 PM</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
