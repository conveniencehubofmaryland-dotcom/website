'use client'
import { useState, useEffect } from 'react'

export default function AvailableShifts() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [shifts, setShifts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/staff/check-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthenticated(true)
      fetchShifts()
      setError('')
    } else {
      setError('Incorrect password')
    }
    setLoading(false)
  }

  const fetchShifts = async () => {
    const res = await fetch('/api/staff/shifts')
    const data = await res.json()
    setShifts(data)
  }

  const handleClaimShift = async (shiftId: string) => {
    const staffName = prompt('Enter your name:')
    if (!staffName) return

    const staffEmail = prompt('Enter your email:')
    if (!staffEmail) return

    const staffPhone = prompt('Enter your phone:')
    if (!staffPhone) return

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const res = await fetch(`${supabaseUrl}/rest/v1/shifts?id=eq.${shiftId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey as string,
        Authorization: `Bearer ${supabaseKey as string}`,
      },
      body: JSON.stringify({
        status: 'claimed',
        staff_name: staffName,
        staff_email: staffEmail,
        staff_phone: staffPhone,
        claimed_at: new Date().toISOString(),
      }),
    })

    if (res.ok) {
      fetchShifts()
      alert('Shift claimed successfully!')
    } else {
      alert('Failed to claim shift')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center text-red-600">Available Shifts</h1>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Access Shifts'}
            </button>
            {error && <p className="text-red-600 text-center">{error}</p>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-red-600">Available Shifts</h1>

        {shifts.length === 0 ? (
          <p className="text-gray-600 text-lg">No shifts available at the moment</p>
        ) : (
          <div className="grid gap-6">
            {shifts.map((shift: any) => (
              <div key={shift.id} className="bg-white rounded-lg shadow p-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="text-xl font-semibold">{shift.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="text-xl font-semibold">{shift.start_time} - {shift.end_time}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="text-xl font-semibold">{shift.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Role</p>
                    <p className="text-xl font-semibold">{shift.role}</p>
                  </div>
                </div>
                {shift.notes && <p className="text-gray-600 mb-4">{shift.notes}</p>}
                <button
                  onClick={() => handleClaimShift(shift.id)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                >
                  Pick Up Shift
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
