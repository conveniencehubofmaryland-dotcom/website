'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      try {
        // Get the applicant ID from localStorage or session
        const applicantId = localStorage.getItem('applicant_id')
        
        if (!applicantId) {
          // No applicant ID, send to welcome center form
          router.push('/welcome-center')
          return
        }

        // Check if they completed orientation
        const res = await fetch(`/api/staff/welcome/check?applicant_id=${applicantId}`)
        const data = await res.json()

        if (data.orientation_accepted) {
          // Already completed, send to training modules
          router.push('/staff/training-modules')
        } else {
          // Not completed, send to welcome center orientation
          router.push(`/welcome-center/orientation/${applicantId}`)
        }
      } catch (err) {
        console.error('Error checking welcome status:', err)
        router.push('/welcome-center')
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}
