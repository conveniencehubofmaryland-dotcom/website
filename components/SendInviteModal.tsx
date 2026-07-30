'use client'

import { useState } from 'react'

interface SendInviteModalProps {
  applicantId: string
  applicantName: string
  applicantEmail: string
  onClose: () => void
  onSuccess: () => void
}

export default function SendInviteModal({
  applicantId,
  applicantName,
  applicantEmail,
  onClose,
  onSuccess,
}: SendInviteModalProps) {
  const [formData, setFormData] = useState({
    full_name: applicantName,
    email: applicantEmail,
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/offer-letters/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="font-serif text-2xl text-chm-black mb-2">Invite Sent!</h2>
          <p className="text-gray-600 mb-4">
            Onboarding link has been sent to <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            They&apos;ll receive an email with instructions to start the onboarding process.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-chm-black">Send Onboarding Invite</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Phone (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red rounded"
              placeholder="(202) 555-0100"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded">
              {error}
            </div>
          )}

          <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
            💡 An onboarding link will be sent to the email address above. The link will expire in 30 days.
          </p>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-600 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red transition-colors rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60 rounded"
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
