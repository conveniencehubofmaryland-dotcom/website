'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AvailableShifts() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/staff/check-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      setAuthenticated(true)
      fetchShifts()
    } else {
      setMessage('❌ Incorrect password')
    }
    setLoading(false)
  }

  const fetchShifts = async () => {
    const res = await fetch('/api/staff/shifts')
    const data = await res.json()
    setShifts(data)
  }

  const handleClaimShift = async (shiftId: string) => {
    const staffName = prompt('Your name:')
    const staffEmail = prompt('Your email:')
    const staffPhone = prompt('Your phone:')

    if (!staffName || !staffEmail || !staffPhone) {
      setMessage('❌ Please provide all details')
      return
    }

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
      setMessage('✅ Shift claimed!')
      fetchShifts()
    } else {
      setMessage('❌ Failed to claim shift')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-red-600 text-center">Staff Portal</h1>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter staff password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Access Portal'}
            </button>
            {message && <p className="text-red-600 text-center font-semibold">{message}</p>}
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-red-600">Available Shifts</h1>

        <div className="bg-white rounded-lg shadow p-8">
          {shifts.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No available shifts at the moment</p>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift: Record<string, any>) => (
                <div key={shift.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 text-sm">Date</p>
                      <p className="font-semibold">{shift.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Time</p>
                      <p className="font-semibold">{shift.start_time} - {shift.end_time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Location</p>
                      <p className="font-semibold">{shift.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Role</p>
                      <p className="font-semibold">{shift.role}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <p className={`font-semibold ${shift.status === 'claimed' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {shift.status === 'claimed' ? 'Claimed' : 'Available'}
                      </p>
                    </div>
                  </div>
                  {shift.notes && <p className="text-gray-600 mb-4">{shift.notes}</p>}
                  {shift.status === 'available' && (
                    <button
                      onClick={() => handleClaimShift(shift.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                    >
                      Pick Up Shift
                    </button>
                  )}
                  {shift.status === 'claimed' && (
                    <p className="text-green-600 font-semibold">Claimed by {shift.staff_name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Staff visit this link</li>
            <li>✓ Enter password: {`"CHM2024"`}</li>
            <li>✓ View available shifts</li>
            <li>✓ Click {`"Pick Up Shift"`} to claim</li>
            <li>✓ You see their details in Manage Shifts</li>
          </ul>
        </div>

        <button onClick={() => setAuthenticated(false)} className="mt-8 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
          Sign Out
        </button>
      </div>
    </div>
  )
}
