'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Line = {
  shift_id: string
  date: string
  location: string
  role: string
  clock_in_at: string | null
  clock_out_at: string | null
  hours: number
  pay_rate: number
  status: string
  amount: number
}

type Sheet = {
  name: string
  week_start: string
  week_end: string
  pay_date: string
  lines: Line[]
  approved_hours: number
  approved_pay: number
  pending_hours: number
}

const fmtTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }) : '—'
const fmtDate = (ymd: string) =>
  new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
const shiftWeek = (ymd: string, days: number) => {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function StaffTimesheetsPage() {
  const router = useRouter()
  const [sheet, setSheet] = useState<Sheet | null>(null)
  const [week, setWeek] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (token: string, w: string | null) => {
    setLoading(true)
    setError('')
    try {
      const url = w ? `/api/staff/timesheets?week=${w}` : '/api/staff/timesheets'
      const res = await fetch(url, { headers: { 'x-staff-token': token } })
      if (res.status === 401) {
        router.replace('/staff/claim-shifts-login')
        return
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load timesheet')
      setSheet(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load timesheet')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    let token: string | null = null
    try {
      token = localStorage.getItem('staff_session_token')
    } catch {
      token = null
    }
    if (!token) {
      router.replace('/staff/claim-shifts-login')
      return
    }
    load(token, week)
  }, [week, load, router])

  const shiftBy = (days: number) => {
    if (!sheet) return
    setWeek(shiftWeek(sheet.week_start, days))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/staff" className="text-sm text-chm-red hover:underline">← Back to staff portal</Link>
        <h1 className="font-serif text-3xl text-chm-black mt-4 mb-2">My Timesheet</h1>
        <p className="text-sm text-gray-500 mb-6">Weeks run Monday to Sunday and are paid the following Friday. Only approved shifts count toward pay.</p>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-chm-red text-sm bg-red-50 p-3 rounded">{error}</p>}

        {sheet && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => shiftBy(-7)} className="px-3 py-2 bg-white border border-gray-200 rounded text-sm">← Previous week</button>
              <p className="text-sm font-semibold text-chm-black">{fmtDate(sheet.week_start)} – {fmtDate(sheet.week_end)} · Pay {fmtDate(sheet.pay_date)}</p>
              <button onClick={() => shiftBy(7)} className="px-3 py-2 bg-white border border-gray-200 rounded text-sm">Next week →</button>
            </div>

            <div className="bg-white shadow-sm overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Job site</th>
                    <th className="px-3 py-2">In</th>
                    <th className="px-3 py-2">Out</th>
                    <th className="px-3 py-2">Hours</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.lines.length === 0 && (
                    <tr><td className="px-3 py-4 text-gray-500" colSpan={7}>No shifts this week.</td></tr>
                  )}
                  {sheet.lines.map(l => (
                    <tr key={l.shift_id} className="border-b border-gray-100">
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(l.date)}</td>
                      <td className="px-3 py-2">{l.location}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtTime(l.clock_in_at)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtTime(l.clock_out_at)}</td>
                      <td className="px-3 py-2">{l.hours.toFixed(2)}</td>
                      <td className="px-3 py-2">{l.status}</td>
                      <td className="px-3 py-2">{l.status === 'Approved' ? `$${l.amount.toFixed(2)}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white shadow-sm p-5 mt-4 text-sm text-gray-800 space-y-1">
              <p><strong>Approved hours:</strong> {sheet.approved_hours.toFixed(2)}</p>
              <p><strong>Approved pay:</strong> ${sheet.approved_pay.toFixed(2)}</p>
              <p className="text-gray-500"><strong>Hours awaiting approval:</strong> {sheet.pending_hours.toFixed(2)} (not in pay yet)</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
