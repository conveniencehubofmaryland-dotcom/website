'use client'

import { useState } from 'react'

interface SendInviteCardProps {
  onSuccess?: () => void
}

export default function SendInviteCard({ onSuccess }: SendInviteCardProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
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

    if (!formData.full_name || !formData.email) {
      setError('Full Name and Email are required')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/admin/offer-letters/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invite')
      }

      setSuccess(true)
      setFormData({ full_name: '', email: '', phone: '' })

      setTimeout(() => {
        setSuccess(false)
        if (onSuccess) onSuccess()
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="text-2xl">✓</div>
          <div>
            <h3 className="font-semibold text-green-700">Invite Sent!</h3>
            <p className="text-sm text-green-600">
              Onboarding link sent to {formData.email}. They can start the process immediately.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
      <div className="mb-6">
        <h2 className="font-semibold text-lg text-chm-black mb-1">Send Onboarding Invite</h2>
        <p className="text-sm text-gray-600">Invite candidates to start their onboarding process</p>
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

        <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          💡 An onboarding link will be sent to the email address above. The link will expire in 30 days.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setFormData({ full_name: '', email: '', phone: '' })}
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
  )
}
