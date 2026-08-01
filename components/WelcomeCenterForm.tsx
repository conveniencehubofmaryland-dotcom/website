'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const POSITIONS = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary/Chef',
  'Nanny/Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]

const SEX_OPTIONS = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
]

export default function WelcomeCenterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invite_token = searchParams.get('invite')

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    sex: '',
    date_of_birth: '',
    position: '',
    years_of_experience: '',
    acknowledged_1099: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [applicantId, setApplicantId] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.phone ||
      !formData.sex ||
      !formData.date_of_birth ||
      !formData.position ||
      formData.years_of_experience === '' ||
      !formData.acknowledged_1099
    ) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/welcome-center/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          years_of_experience: parseInt(formData.years_of_experience),
          invite_token,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit profile')
      }

      setApplicantId(data.applicant_id)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleContinueToOrientation = () => {
    if (applicantId) {
      router.push(
        `/staff/orientation?applicant_id=${applicantId}&position=${encodeURIComponent(formData.position)}`
      )
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow p-12">
            <div className="text-5xl mb-4">✓</div>
            <h1 className="font-serif text-3xl text-chm-black mb-4">Profile Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for completing your welcome profile, {formData.full_name.split(' ')[0]}!
            </p>
            <div className="bg-cream p-6 rounded-lg mb-8">
              <p className="text-sm text-gray-700 mb-4">
                Check your email for next steps. You&apos;ll receive:
              </p>
              <ul className="text-left space-y-2 text-sm text-gray-700 mb-8">
                <li>✓ Orientation document to review and sign</li>
                <li>✓ Link to required training modules</li>
                <li>✓ Instructions to claim your first shift</li>
              </ul>
              <button
                onClick={handleContinueToOrientation}
                className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors rounded"
              >
                Continue to Orientation →
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              Questions? Contact HR at 202-579-2944 or conveniencehubofmaryland@gmail.com
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-4xl text-chm-black mb-3">Welcome to CHM</h1>
          <p className="text-gray-600">Complete your profile to get started with your onboarding.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="(202) 555-0100"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Sex / Gender *
            </label>
            <select
              name="sex"
              required
              value={formData.sex}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="">Select…</option>
              {SEX_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              name="date_of_birth"
              required
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Position Applied For *
            </label>
            <select
              name="position"
              required
              value={formData.position}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
            >
              <option value="">Select…</option>
              {POSITIONS.map(pos => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Years of Experience *
            </label>
            <input
              type="number"
              name="years_of_experience"
              required
              min={0}
              max={80}
              value={formData.years_of_experience}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="e.g. 5"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acknowledged_1099"
                required
                checked={formData.acknowledged_1099}
                onChange={handleChange}
                className="w-5 h-5 accent-chm-red mt-1 flex-shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-chm-black">
                  I acknowledge this is a 1099 independent contractor position *
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  I understand that I am an independent contractor and not an employee. I am responsible for my own taxes, insurance, and benefits.
                </p>
              </div>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chm-red text-white py-4 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60 rounded"
          >
            {loading ? 'Submitting...' : 'Submit Profile'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            All fields are required. Please review your information before submitting.
          </p>
        </form>
      </div>
    </div>
  )
}
