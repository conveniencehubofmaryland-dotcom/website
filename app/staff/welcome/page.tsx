'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkStatus() {
      try {
        // Get the applicant ID from localStorage
        const applicantId = typeof window !== 'undefined' ? localStorage.getItem('applicant_id') : null
        
        if (!applicantId) {
          // No applicant ID stored, send to welcome center form
          router.push('/welcome-center')
          return
        }

        // Check if they completed orientation
        const res = await fetch(`/api/staff/welcome/check?applicant_id=${applicantId}`)
        const data = await res.json()

        if (data.orientation_accepted) {
          // Already completed orientation, send to training modules
          router.push('/staff/training-modules')
        } else {
          // Not completed, send to welcome center orientation
          router.push(`/welcome-center/orientation/${applicantId}`)
        }
      } catch (err) {
        console.error('Error checking welcome status:', err)
        setError('Failed to load. Please try again.')
        setLoading(false)
      }
    }

    checkStatus()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/welcome-center" className="text-chm-red font-semibold hover:underline">
            Start over
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        <p className="text-gray-500">Loading your welcome experience...</p>
      </div>
    </div>
  )
}
