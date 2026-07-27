'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WelcomeCenterPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [applicantId, setApplicantId] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    address: '',
  })

  const POSITIONS = [
    'Cleaning Specialist',
    'Laundry Handler',
    'Culinary/Chef',
    'Nanny/Childcare Specialist',
    'Care Companion (Adult/Senior)',
    'Housekeeping Staff',
  ]

  useEffect(() => {
    async function checkStatus() {
      try {
        let id = localStorage.getItem('applicant_id')
        if (!id) {
          const cookies = document.cookie.split(';')
          const applCookie = cookies.find(c => c.trim().startsWith('applicant_id='))
          id = applCookie ? applCookie.split('=')[1] : null
        }

        // If no applicant_id, allow them to create new profile
        if (!id) {
          setLoading(false)
          return
        }

        // If applicant_id exists, check their status
        const res = await fetch(`/api/staff/welcome/check?applicant_id=${id}`)
        if (res.ok) {
          const data = await res.json()
          // Allow if: how_it_works_read OR if they haven't started yet (new)
          if (data.onboarding_status === 'how_it_works_read' || data.onboarding_status === 'new') {
            setApplicantId(id)
          }
        }
      } catch (err) {
        console.error('Status check error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/welcome-center/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')

      localStorage.setItem('applicant_id', data.id)
      localStorage.setItem('position', formData.position)
      document.cookie = `applicant_id=${data.id}; path=/; max-age=2592000`
      document.cookie = `chm_position=${encodeURIComponent(formData.position)}; path=/; max-age=86400`

      setApplicantId(data.id)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 shadow-sm rounded text-center">
            <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-chm-black mb-4">Welcome to CHM!</h1>
            <p className="text-gray-600 mb-6">Your profile has been created successfully. You&apos;re ready to move forward with your onboarding.</p>
            <Link href={`/staff/orientation?position=${encodeURIComponent(formData.position)}&applicant_id=${applicantId}`} className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
              Continue to Orientation
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">Welcome to CHM</h1>
          <p className="text-sm text-gray-500">Start your onboarding journey with Convenience Hub of Maryland</p>
        </div>

        <div className="bg-white p-8 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
                Position (Select One)
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
              >
                <option value="">Select a position</option>
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">This position will be locked throughout your onboarding process and cannot be changed.</p>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
                Address (Optional)
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                placeholder="Your home address"
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-chm-red text-white py-4 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Questions? Call 202-579-2944 (Mon–Sat, 9 AM–9 PM)
        </p>
      </div>
    </div>
  )
}
