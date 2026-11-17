'use client'

import { useState } from 'react'

// Payroll export: approved shifts for a date range, for the outside payroll company.
export default function AdminPayrollPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [start, setStart] = useState(`${new Date().getFullYear()}-01-01`)
  const [end, setEnd] = useState(today)
  const [error, setError] = useState('')

  function download(format: 'shifts' | 'annual') {
    if (!start || !end || start > end) {
      setError('Choose a start date that is on or before the end date.')
      return
    }
    setError('')
    window.location.href = `/api/admin/payroll?start=${start}&end=${end}&format=${format}`
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-serif text-4xl text-chm-black mb-2">Payroll Export</h1>
      <p className="text-gray-600 text-sm mb-8">
        Approved shifts only, for the date range you choose. Pay is hours worked times pay rate, the same as the timesheets.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <label className="text-sm">
          <span className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Start date</span>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full border border-gray-200 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="block text-xs uppercase tracking-widest text-gray-500 mb-2">End date</span>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full border border-gray-200 px-3 py-2" />
        </label>
      </div>

      {error && <p className="text-chm-red text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-gray-200 p-5">
          <p className="font-semibold text-chm-black mb-1">Shift detail (CSV)</p>
          <p className="text-xs text-gray-500 mb-4">One row per approved shift: name, email, position, date, client location, clock times, hours, rate, amount.</p>
          <button onClick={() => download('shifts')} className="px-4 py-2 bg-chm-red text-white text-xs uppercase tracking-widest font-semibold">Download shifts</button>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="font-semibold text-chm-black mb-1">Contractor totals (CSV)</p>
          <p className="text-xs text-gray-500 mb-4">One row per contractor: approved shifts, total hours, total approved pay, and whether a W-9 is on file. Use Jan 1 to Dec 31 for a yearly total.</p>
          <button onClick={() => download('annual')} className="px-4 py-2 bg-chm-red text-white text-xs uppercase tracking-widest font-semibold">Download totals</button>
        </div>
      </div>
    </div>
  )
}
