'use client'
import { useState, useEffect } from 'react'

type Shift = {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  role: string
  pay_rate?: number
  job_description?: string
  notes?: string
  status: 'available' | 'claimed'
  staff_name?: string
  staff_email?: string
  staff_phone?: string
}

type ClaimForm = {
  name: string
  email: string
  phone: string
}

export default function AvailableShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [claimingShiftId, setClaimingShiftId] = useState<string | null>(null)
  const [claimForm, setClaimForm] = useState<ClaimForm>({ name: '', email: '', phone: '' })

  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/shifts/available')
      if (!res.ok) throw new Error('Failed to fetch shifts')
      const data: Shift[] = await res.json()
      setShifts(data)
    } catch (error) {
      console.error('Error fetching shifts:', error)
      setMessage('❌ Failed to load shifts')
      setShifts([])
    } finally {
      setLoading(false)
    }
  }

  const handleClaimSubmit = async (e: React.FormEvent, shiftId: string) => {
    e.preventDefault()

    if (!claimForm.name || !claimForm.email || !claimForm.phone) {
      setMessage('❌ Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/shifts/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          staffName: claimForm.name,
          staffEmail: claimForm.email,
          staffPhone: claimForm.phone,
        }),
      })

      if (res.ok) {
        setMessage('✅ Shift claimed! Check your email for details.')
        setClaimingShiftId(null)
        setClaimForm({ name: '', email: '', phone: '' })
        fetchShifts()
      } else {
        const error = await res.text()
        setMessage(`❌ Failed to claim shift: ${error}`)
      }
    } catch (error) {
      setMessage('❌ Error claiming shift')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-red-600">Available Shifts</h1>
        <p className="text-gray-600 mb-8">Browse and claim shifts below. You'll receive a confirmation email with all details.</p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        {loading && !claimingShiftId ? (
          <div className="text-center py-12 text-gray-500">Loading shifts...</div>
        ) : shifts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No available shifts at the moment.</p>
            <p className="text-gray-500 mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift: Shift) => (
              <div key={shift.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {/* Shift Details */}
                <div className="p-6 border-b border-gray-200">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{shift.role}</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">📅 Date</p>
                          <p className="font-semibold text-lg">{new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">🕐 Time</p>
                          <p className="font-semibold text-lg">{shift.start_time} - {shift.end_time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">📍 Location</p>
                          <p className="font-semibold text-lg">{shift.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">💰 Pay Rate</p>
                          <p className="font-semibold text-lg text-green-600">${shift.pay_rate || 'TBD'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      {shift.job_description && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">📋 Job Description</p>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="text-gray-700 whitespace-pre-wrap">{shift.job_description}</p>
                          </div>
                        </div>
                      )}
                      {shift.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 mb-2">📝 Additional Notes</p>
                          <p className="text-gray-700">{shift.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Claim Form or Status */}
                {shift.status === 'claimed' ? (
                  <div className="p-6 bg-green-50">
                    <p className="text-green-700 font-semibold">✅ Shift claimed by {shift.staff_name}</p>
                  </div>
                ) : claimingShiftId === shift.id ? (
                  <form onSubmit={(e) => handleClaimSubmit(e, shift.id)} className="p-6 bg-blue-50 border-t border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4">Claim This Shift</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={claimForm.name}
                          onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })}
                          placeholder="Your full name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={claimForm.email}
                          onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                          placeholder="your.email@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                        <input
                          type="tel"
                          required
                          value={claimForm.phone}
                          onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                          placeholder="(202) 555-0000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {loading ? 'Processing...' : 'Confirm Claim'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setClaimingShiftId(null)}
                          className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="p-6">
                    <button
                      onClick={() => setClaimingShiftId(shift.id)}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
                    >
                      Claim Shift
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
