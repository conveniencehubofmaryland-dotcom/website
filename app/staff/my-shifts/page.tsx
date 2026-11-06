'use client'
import { useCallback, useEffect, useState } from 'react'

type MyShift = {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  role: string
  pay_rate?: number | null
  clock_in_at?: string | null
  clock_out_at?: string | null
  staff_confirmed_at?: string | null
  approved_at?: string | null
  hours_worked?: number | null
}

const TZ = 'America/New_York'

function fmt(iso?: string | null) {
  return iso ? new Date(iso).toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' }) : '—'
}

export default function MyShiftsPage() {
  const [shifts, setShifts] = useState<MyShift[]>([])
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const loadShifts = useCallback(async (token: string) => {
    const res = await fetch(`/api/staff/my-shifts?token=${encodeURIComponent(token)}`)
    if (!res.ok) throw new Error('Failed to load shifts')
    setShifts(await res.json())
  }, [])

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem('staff_session_token')
      if (!token) {
        setMessage('❌ Please sign in to see your shifts.')
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/staff/login/check?token=${encodeURIComponent(token)}`)
        if (!res.ok) {
          localStorage.removeItem('staff_session_token')
          localStorage.removeItem('staff_email')
          setMessage('❌ Session expired. Please sign in again.')
          setLoading(false)
          return
        }
        setAuthorized(true)
        await loadShifts(token)
      } catch {
        setMessage('❌ Failed to load shifts')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [loadShifts])

  const act = async (shiftId: string, action: 'clock_in' | 'clock_out' | 'confirm') => {
    const token = localStorage.getItem('staff_session_token') ?? ''
    setBusyId(shiftId)
    setMessage('')
    try {
      const res = await fetch('/api/staff/my-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: token, shiftId, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(`❌ ${data.error || 'Something went wrong'}`)
      } else {
        setMessage(action === 'clock_in' ? '✅ Clocked in.' : action === 'clock_out' ? '✅ Clocked out. Please confirm the shift is complete.' : '✅ Thank you. Shift marked complete.')
        await loadShifts(token)
      }
    } catch {
      setMessage('❌ Network error. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-4">My Shifts</h1>
          <p className="text-red-600 mb-6">{loading ? 'Checking your sign-in...' : message || 'You must sign in to see your shifts.'}</p>
          {!loading && (
            <a href="/staff/claim-shifts-login" className="inline-block bg-red-600 text-white px-6 py-3 font-semibold rounded-lg hover:bg-red-700">
              Sign In
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-red-600">My Shifts</h1>
            <p className="text-gray-600 mt-2">Clock in when you arrive, clock out when you finish, then confirm.</p>
          </div>
          <a href="/staff/available-shifts" className="text-red-600 underline text-sm">Available shifts</a>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : shifts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">You have not claimed any shifts yet.</div>
        ) : (
          <div className="space-y-4">
            {shifts.map(shift => {
              const busy = busyId === shift.id
              return (
                <div key={shift.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{shift.role}</h3>
                      <p className="text-gray-700">{new Date(shift.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-gray-700">{shift.start_time} - {shift.end_time}</p>
                      <p className="text-gray-600 text-sm">📍 {shift.location}</p>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>Clock in: <span className="font-semibold">{fmt(shift.clock_in_at)}</span></p>
                      <p>Clock out: <span className="font-semibold">{fmt(shift.clock_out_at)}</span></p>
                      {shift.hours_worked != null && <p>Hours: <span className="font-semibold">{shift.hours_worked}</span></p>}
                      {shift.approved_at ? (
                        <p className="text-green-700 font-semibold">✅ Approved</p>
                      ) : shift.staff_confirmed_at ? (
                        <p className="text-green-700 font-semibold">✅ You confirmed completion</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {!shift.clock_in_at && (
                      <button onClick={() => act(shift.id, 'clock_in')} disabled={busy}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                        {busy ? 'Working...' : 'Clock In'}
                      </button>
                    )}
                    {shift.clock_in_at && !shift.clock_out_at && (
                      <button onClick={() => act(shift.id, 'clock_out')} disabled={busy}
                        className="bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold hover:bg-black disabled:opacity-50">
                        {busy ? 'Working...' : 'Clock Out'}
                      </button>
                    )}
                    {shift.clock_out_at && !shift.staff_confirmed_at && (
                      <button onClick={() => act(shift.id, 'confirm')} disabled={busy}
                        className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                        {busy ? 'Working...' : 'Confirm Shift Completed'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
