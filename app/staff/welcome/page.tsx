'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StaffPage() {
  const router = useRouter()
  const [staffName, setStaffName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const applicantId = typeof window !== 'undefined' ? localStorage.getItem('applicant_id') : null
        
        if (!applicantId) {
          router.push('/welcome-center')
          return
        }

        const res = await fetch(`/api/staff/welcome/check?applicant_id=${applicantId}`)
        if (!res.ok) {
          router.push('/welcome-center')
          return
        }

        const data = await res.json()
        
        if (!data.orientation_accepted) {
          router.push('/welcome-center')
          return
        }

        setStaffName(data.staffName || 'Staff Member')
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/welcome-center')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

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
          <Link href="/staff/training-modules" className="block">
            <p className="font-serif text-xl text-chm-black mb-2">Continue Training</p>
            <p className="text-sm text-gray-700">Complete your required training modules to get started.</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
