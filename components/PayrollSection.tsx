'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type PayrollShift = {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  role: string
  pay_rate?: number | null
  staff_name?: string | null
  staff_email?: string | null
  clock_in_at?: string | null
  clock_out_at?: string | null
  staff_confirmed_at?: string | null
  approved_at?: string | null
  hours_worked?: number | null
}

const TZ = 'America/New_York'

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function mondayOf(d: Date) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = copy.getDay()
  copy.setDate(copy.getDate() + (day === 0 ? -6 : 1 - day))
  return copy
}

function fmt(iso?: string | null) {
  return iso ? new Date(iso).toLocaleString('en-US', { timeZone: TZ, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''
}

function minutesOf(s: PayrollShift) {
  if (!s.clock_in_at || !s.clock_out_at) return null
  return Math.round((Date.parse(s.clock_out_at) - Date.parse(s.clock_in_at)) / 60000)
}

function statusOf(s: PayrollShift) {
  if (s.approved_at) return 'Approved'
  if (s.clock_out_at && s.staff_confirmed_at) return 'Ready to approve'
  if (s.clock_out_at) return 'Waiting for staff to confirm'
  if (s.clock_in_at) return 'Clocked in, no clock-out'
  return 'Not started'
}

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

export default function PayrollSection() {
  const [rows, setRows] = useState<PayrollShift[]>([])
  const [weekStart, setWeekStart] = useState(() => toYMD(mondayOf(new Date())))
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const weekEnd = useMemo(() => {
    const d = new Date(`${weekStart}T00:00:00`)
    d.setDate(d.getDate() + 6)
    return toYMD(d)
  }, [weekStart])

  const weekRows = useMemo(
    () => rows.filter(r => r.date >= weekStart && r.date <= weekEnd),
    [rows, weekStart, weekEnd]
  )
  const approvedRows = weekRows.filter(r => r.approved_at)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/payroll')
      if (!res.ok) throw new Error('Failed to load')
      setRows(await res.json())
    } catch {
      setMessage('❌ Failed to load payroll list')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const send = async (body: Record<string, unknown>) => {
    setMessage('')
    const res = await fetch('/api/admin/payroll', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setMessage(`❌ ${data.error?.message || data.error || 'Update failed'}`)
      return false
    }
    await load()
    return true
  }

  const saveClockOut = async (shiftId: string) => {
    if (!editValue) return
    const ok = await send({ shiftId, action: 'set_clock_out', clockOutAt: new Date(editValue).toISOString() })
    if (ok) {
      setEditingId(null)
      setEditValue('')
      setMessage('✅ Clock-out saved.')
    }
  }

  const exportCsv = () => {
    const header = ['Staff Name', 'Email', 'Position', 'Shift Date', 'Shift Start', 'Shift End', 'Clock In', 'Clock Out', 'Minutes Worked', 'Hours Worked', 'Pay Rate', 'Client Location']
    const lines = approvedRows.map(r => [
      r.staff_name, r.staff_email, r.role, r.date, r.start_time, r.end_time,
      fmt(r.clock_in_at), fmt(r.clock_out_at), minutesOf(r), r.hours_worked, r.pay_rate, r.location,
    ].map(csvCell).join(','))
    const csv = [header.map(csvCell).join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-${weekStart}-to-${weekEnd}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2 className="font-serif text-3xl text-chm-black mb-2">Payroll</h2>
      <p className="text-sm text-gray-600 mb-6">
        Staff who claimed shifts. Approve each completed shift, then export the approved shifts for the payroll company.
      </p>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold text-gray-700 mb-2">Week starting (Monday)</label>
          <input
            type="date"
            value={weekStart}
            onChange={e => setWeekStart(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded text-sm"
          />
        </div>
        <p className="text-sm text-gray-600 pb-2">Showing {weekStart} to {weekEnd}</p>
        <button
          onClick={exportCsv}
          disabled={approvedRows.length === 0}
          className="ml-auto bg-chm-red text-white py-2 px-5 rounded font-semibold text-sm uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
        >
          Export Approved ({approvedRows.length})
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {weekRows.length === 0 ? (
          <p className="text-gray-600 p-6 text-center text-sm">No claimed shifts in this week.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Date', 'Staff', 'Email', 'Position', 'Clock In', 'Clock Out', 'Hours', 'Pay Rate', 'Client Location', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs uppercase tracking-widest font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekRows.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 align-top">
                    <td className="px-3 py-3 whitespace-nowrap">{r.date}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.staff_name}</td>
                    <td className="px-3 py-3">{r.staff_email}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.role}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{fmt(r.clock_in_at) || '—'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {fmt(r.clock_out_at) || '—'}
                      {r.clock_in_at && !r.clock_out_at && !r.approved_at && (
                        editingId === r.id ? (
                          <div className="mt-2 space-y-2">
                            <input
                              type="datetime-local"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="px-2 py-1 border border-gray-200 rounded text-xs"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => saveClockOut(r.id)} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Save</button>
                              <button onClick={() => { setEditingId(null); setEditValue('') }} className="text-xs px-2 py-1 bg-gray-200 rounded">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingId(r.id); setEditValue('') }} className="block mt-1 text-xs text-red-600 underline">
                            Enter clock-out
                          </button>
                        )
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{r.hours_worked ?? '—'}</td>
                    <td className="px-3 py-3 whitespace-nowrap">${r.pay_rate ?? 'TBD'}</td>
                    <td className="px-3 py-3">{r.location}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{statusOf(r)}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {r.approved_at ? (
                        <button onClick={() => send({ shiftId: r.id, action: 'unapprove' })} className="text-xs px-2 py-1 bg-gray-200 rounded">Undo approval</button>
                      ) : r.clock_out_at ? (
                        <button onClick={() => send({ shiftId: r.id, action: 'approve' })} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Approve</button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
