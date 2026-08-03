'use client'

import { useState } from 'react'

interface StaffRecord {
  id: string
  full_name: string
  email: string
  phone: string
  sex: string
  date_of_birth: string
  position: string
  years_of_experience: number
  acknowledged_1099: boolean
  onboarding_status: string
  created_at: string
  no_show_count: number
  notes?: string | null
}

const POSITIONS = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary/Chef',
  'Nanny/Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]

const ONBOARDING_STATUSES = [
  'new',
  'profile_submitted',
  'orientation_completed',
  'ready_to_claim_shifts',
]

interface CreateStaffModalProps {
  onClose: () => void
  onSuccess: (record: StaffRecord) => void
}

export default function CreateStaffModal({ onClose, onSuccess }: CreateStaffModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    sex: '',
    date_of_birth: '',
    position: '',
    years_of_experience: 0,
    acknowledged_1099: false,
    onboarding_status: 'new',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create staff record')
      }

      const newRecord = await res.json()
      onSuccess(newRecord)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-serif text-chm-black">Create New Staff Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Sex *
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              >
                <option value="">Select…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Position *
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
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
                Years of Experience
              </label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Onboarding Status
              </label>
              <select
                name="onboarding_status"
                value={formData.onboarding_status}
                onChange={handleChange}
                className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
              >
                {ONBOARDING_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status === 'new'
                      ? 'New'
                      : status === 'profile_submitted'
                      ? 'Profile Submitted'
                      : status === 'orientation_completed'
                      ? 'Orientation Completed'
                      : 'Ready to Claim Shifts'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acknowledged_1099"
                checked={formData.acknowledged_1099}
                onChange={handleChange}
                className="w-4 h-4 accent-chm-red"
              />
              <span className="text-sm text-gray-600">Acknowledged 1099 Status</span>
            </label>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red rounded"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 px-4 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-gray-50 transition-colors rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-chm-red text-white px-4 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-colors rounded"
            >
              {loading ? 'Creating…' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
