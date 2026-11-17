import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { sbFetch, type ShiftRow } from '@/lib/shift-eligibility'
import { hoursFor } from '@/lib/timesheet'

// Payroll export for the outside payroll company. Approved shifts only, for a date range (YYYY-MM-DD).
//   format=shifts  one row per approved shift (name, email, position, date, hours, rate, amount)
//   format=annual  one row per contractor: total hours, total approved pay, shifts, W-9 on file
// Payroll amounts are the same as the Timesheets page: hours x pay rate, rounded to cents.
const DATE = /^\d{4}-\d{2}-\d{2}$/

function csvCell(v: unknown): string {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

const money = (n: number) => Math.round(n * 100) / 100

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const start = req.nextUrl.searchParams.get('start') || ''
  const end = req.nextUrl.searchParams.get('end') || ''
  const format = req.nextUrl.searchParams.get('format') === 'annual' ? 'annual' : 'shifts'
  if (!DATE.test(start) || !DATE.test(end) || start > end) {
    return NextResponse.json({ error: 'Choose a start and end date.' }, { status: 400 })
  }

  const res = await sbFetch(
    `shifts?approved_at=not.is.null&and=(date.gte.${start},date.lte.${end})&select=*&order=date.asc`
  )
  if (!res.ok) return NextResponse.json({ error: 'Could not load shifts.' }, { status: 500 })
  const shifts = ((await res.json()) as ShiftRow[]).filter(s => s.approved_at)

  const shiftRows = shifts.map(s => {
    const hours = Math.round(hoursFor(s) * 100) / 100
    const rate = Number(s.pay_rate ?? 0)
    return {
      name: s.staff_name || '',
      email: (s.staff_email || '').toLowerCase(),
      position: s.role,
      date: s.date,
      location: s.location,
      clockIn: s.clock_in_at || '',
      clockOut: s.clock_out_at || '',
      hours,
      rate,
      amount: money(hours * rate),
    }
  })

  if (format === 'shifts') {
    const csv = toCsv(
      ['Staff name', 'Email', 'Position', 'Shift date', 'Client location', 'Clock in (UTC)', 'Clock out (UTC)', 'Hours', 'Pay rate', 'Amount'],
      shiftRows.map(r => [r.name, r.email, r.position, r.date, r.location, r.clockIn, r.clockOut, r.hours.toFixed(2), r.rate.toFixed(2), r.amount.toFixed(2)])
    )
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="chm-payroll-shifts-${start}-to-${end}.csv"`,
      },
    })
  }

  // Annual summary: one row per contractor, using the email on the shift.
  const w9Res = await sbFetch('w9_forms?select=staff_email')
  const w9Rows = w9Res.ok ? ((await w9Res.json()) as { staff_email: string | null }[]) : []
  const w9Emails = new Set(w9Rows.map(w => (w.staff_email || '').toLowerCase()).filter(Boolean))

  const byPerson = new Map<string, { name: string; email: string; hours: number; pay: number; shifts: number }>()
  for (const r of shiftRows) {
    const key = r.email || r.name
    const p = byPerson.get(key) || { name: r.name, email: r.email, hours: 0, pay: 0, shifts: 0 }
    p.hours += r.hours
    p.pay += r.hours * r.rate
    p.shifts += 1
    byPerson.set(key, p)
  }
  const people = Array.from(byPerson.values()).sort((a, b) => a.name.localeCompare(b.name))
  const csv = toCsv(
    ['Staff name', 'Email', 'Approved shifts', 'Total hours', 'Total approved pay', 'W-9 on file'],
    people.map(p => [p.name, p.email, p.shifts, p.hours.toFixed(2), money(p.pay).toFixed(2), w9Emails.has(p.email) ? 'Yes' : 'No'])
  )
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="chm-payroll-annual-${start}-to-${end}.csv"`,
    },
  })
}
