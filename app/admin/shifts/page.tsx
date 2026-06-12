'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ManageShifts() {
  const [shifts, setShifts] = useState([])
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    role: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    fetchShifts()
  }, [])

  const fetchShifts = async () => {
    const res = await fetch(`${supabaseUrl}/rest/v1/shifts?order=date.asc`, {
      headers: { apikey: supabaseKey as string, Authorization: `Bearer ${supabaseKey as string}` },
    })
    const data = await res.json()
    setShifts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch(`${supabaseUrl}/rest/v1/shifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey as string,
        Authorization: `Bearer ${supabaseKey as string}`,
      },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      setMessage('✅ Shift created!')
      setFormData({ date: '', start_time: '', end_time: '', location: '', role: '', notes: '' })
      fetchShifts()
    } else {
      setMessage('❌ Failed to create shift')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shift?')) return

    const res = await fetch(`${supabaseUrl}/rest/v1/shifts?id=eq.${id}`, {
      method: 'DELETE',
      headers: { apikey: supabaseKey as string, Authorization: `Bearer ${supabaseKey as string}` },
    })

    if (res.ok) {
      setMessage('✅ Shift deleted')
      fetchShifts()
    } else {
      setMessage('❌ Failed to delete shift')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/admin" className="text-red-600 hover:underline mb-6 inline-block">
          ← Back to Admin
        </Link>

        <h1 className="text-4xl font-bold mb-8 text-red-600">Manage Shifts</h1>

        {/* Create Shift Form */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Create New Shift</h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="time"
              required
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Start Time"
            />
            <input
              type="time"
              required
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="End Time"
            />
            <input
              type="text"
              required
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              required
              placeholder="Role/Position"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Shift'}
            </button>
            {message && (
              <p className={`md:col-span-2 text-center font-semibold ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Shifts List */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">All Shifts</h2>

          {shifts.length === 0 ? (
            <p className="text-gray-600">No shifts yet</p>
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
                      <p className={`font-semibold ${shift.status === 'claimed' ? 'text-green-600' : 'text-gray-600'}`}>
                        {shift.status}
                      </p>
                    </div>
                  </div>

                  {shift.status === 'claimed' && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Claimed by</p>
                      <p className="font-semibold">{shift.staff_name} • {shift.staff_email} • {shift.staff_phone}</p>
                      <p className="text-xs text-gray-500">Claimed at: {new Date(shift.claimed_at).toLocaleString()}</p>
                    </div>
                  )}

                  {shift.notes && <p className="text-gray-600 mb-4">{shift.notes}</p>}

                  <button
                    onClick={() => handleDelete(shift.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Delete Shift
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
