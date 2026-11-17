'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Line = {
  shift_id: string
  date: string
  location: string
  role: string
  hours: number
  pay_rate: number
  status: string
  amount: number
}

type Statement = {
  name: string
  week_start: string
  week_end: string
  pay_date: string
  lines: Line[]
  approved_hours: number
  approved_pay: number
  pending_hours: number
}

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function longDate(ymd: string) {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Pay statement for one week. Built from approved shifts only, on the staff member's own sign-in.
export default function PaystubPage() {
  const [data, setData] = useState<Statement | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const week = new URLSearchParams(window.location.search).get('week') || ''
    let token: string | null = null
    try {
      token = localStorage.getItem('staff_session_token')
    } catch {
      token = null
    }
    if (!token) {
      setError('Please sign in to the staff portal to see your pay statement.')
      setLoading(false)
      return
    }
    const qs = /^\d{4}-\d{2}-\d{2}$/.test(week) ? `?week=${week}` : ''
    fetch(`/api/staff/timesheets${qs}`, { headers: { 'x-staff-token': token } })
      .then(async res => {
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.error || 'Could not load this pay statement.')
        setData(body as Statement)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load this pay statement.'))
      .finally(() => setLoading(false))
  }, [])

  const approvedLines = data ? data.lines.filter(l => l.status === 'Approved') : []

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-8 print:border-0 print:p-0">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/staff/my-documents" className="text-sm text-chm-red hover:underline">Back to My Documents</Link>
          {data && (
            <button onClick={() => window.print()} className="px-4 py-2 bg-chm-red text-white text-xs uppercase tracking-widest font-semibold rounded">
              Print
            </button>
          )}
        </div>

        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {error && <p className="text-chm-red text-sm">{error}</p>}

        {data && (
          <>
            <div className="border-b border-gray-200 pb-4 mb-6">
              <p className="font-serif text-2xl text-chm-black">Convenience Hub of Maryland, LLC</p>
              <p className="text-sm text-gray-600 mt-1">Pay statement for independent contractor</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">Contractor</p>
                <p className="text-chm-black">{data.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">Pay date</p>
                <p className="text-chm-black">{longDate(data.pay_date)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">Pay period</p>
                <p className="text-chm-black">{longDate(data.week_start)} to {longDate(data.week_end)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">Taxes withheld</p>
                <p className="text-chm-black">None (independent contractor)</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-widest text-gray-500 border-b border-gray-200">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Location</th>
                    <th className="py-2 pr-3">Role</th>
                    <th className="py-2 pr-3 text-right">Hours</th>
                    <th className="py-2 pr-3 text-right">Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedLines.map(line => (
                    <tr key={line.shift_id} className="border-b border-gray-100">
                      <td className="py-2 pr-3">{longDate(line.date)}</td>
                      <td className="py-2 pr-3">{line.location}</td>
                      <td className="py-2 pr-3">{line.role}</td>
                      <td className="py-2 pr-3 text-right">{line.hours.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-right">{money(line.pay_rate)}</td>
                      <td className="py-2 text-right">{money(line.amount)}</td>
                    </tr>
                  ))}
                  {approvedLines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-gray-500">No approved shifts in this period.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="font-semibold text-chm-black">
                    <td colSpan={3} className="pt-3 pr-3">Total approved</td>
                    <td className="pt-3 pr-3 text-right">{data.approved_hours.toFixed(2)}</td>
                    <td className="pt-3 pr-3" />
                    <td className="pt-3 text-right">{money(data.approved_pay)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {data.pending_hours > 0 && (
              <p className="text-xs text-gray-500 mt-4">
                {data.pending_hours.toFixed(2)} hours in this period are awaiting approval and are not included above.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
