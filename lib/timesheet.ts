// Weekly timesheets: Monday to Sunday, paid the following Friday. Only approved shifts count toward pay.
import { sbFetch, todayInEastern, type ShiftRow } from '@/lib/shift-eligibility'

export type TimesheetLine = {
  shift_id: string
  date: string
  location: string
  role: string
  clock_in_at: string | null
  clock_out_at: string | null
  hours: number
  pay_rate: number
  status: 'Approved' | 'Awaiting approval' | 'No clock-in' | 'No clock-out'
  amount: number
}

export type Timesheet = {
  week_start: string
  week_end: string
  pay_date: string
  lines: TimesheetLine[]
  approved_hours: number
  approved_pay: number
  pending_hours: number
}

function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// Monday of the most recent full week (Monday to Sunday) before today in Eastern time.
export function lastCompletedWeekStart(today = todayInEastern()): string {
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay() // 0 = Sunday
  const offsetToSunday = dow === 0 ? 7 : dow
  const sunday = addDays(today, -offsetToSunday)
  return addDays(sunday, -6)
}

// Accepts any date and returns the Monday of its week.
export function mondayOf(ymd: string): string {
  const dow = new Date(`${ymd}T12:00:00Z`).getUTCDay()
  return addDays(ymd, -((dow + 6) % 7))
}

function hoursFor(shift: ShiftRow): number {
  if (shift.hours_worked != null) return Number(shift.hours_worked)
  if (shift.clock_in_at && shift.clock_out_at) {
    const minutes = (Date.parse(shift.clock_out_at) - Date.parse(shift.clock_in_at)) / 60000
    return Math.round((minutes / 60) * 100) / 100
  }
  return 0
}

export function buildTimesheet(shifts: ShiftRow[], weekStart: string): Timesheet {
  const weekEnd = addDays(weekStart, 6)
  const lines: TimesheetLine[] = shifts
    .filter(s => s.date >= weekStart && s.date <= weekEnd)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(s => {
      const hours = hoursFor(s)
      const rate = Number(s.pay_rate ?? 0)
      let status: TimesheetLine['status']
      if (!s.clock_in_at) status = 'No clock-in'
      else if (!s.clock_out_at) status = 'No clock-out'
      else if (s.approved_at) status = 'Approved'
      else status = 'Awaiting approval'
      const amount = status === 'Approved' ? Math.round(hours * rate * 100) / 100 : 0
      return {
        shift_id: s.id,
        date: s.date,
        location: s.location,
        role: s.role,
        clock_in_at: s.clock_in_at ?? null,
        clock_out_at: s.clock_out_at ?? null,
        hours,
        pay_rate: rate,
        status,
        amount,
      }
    })

  const approved = lines.filter(l => l.status === 'Approved')
  return {
    week_start: weekStart,
    week_end: weekEnd,
    pay_date: addDays(weekEnd, 5), // the Friday after the Sunday that ends the week
    lines,
    approved_hours: Math.round(approved.reduce((t, l) => t + l.hours, 0) * 100) / 100,
    approved_pay: Math.round(approved.reduce((t, l) => t + l.amount, 0) * 100) / 100,
    pending_hours: Math.round(lines.filter(l => l.status !== 'Approved').reduce((t, l) => t + l.hours, 0) * 100) / 100,
  }
}

// Loads all of one applicant's shifts for a week.
export async function loadWeekShifts(applicantId: string, weekStart: string): Promise<ShiftRow[]> {
  const weekEnd = addDays(weekStart, 6)
  const res = await sbFetch(
    `shifts?applicant_id=eq.${encodeURIComponent(applicantId)}&and=(date.gte.${weekStart},date.lte.${weekEnd})&select=*`
  )
  if (!res.ok) return []
  const rows = await res.json()
  return Array.isArray(rows) ? (rows as ShiftRow[]) : []
}

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const money = (n: number) => `$${n.toFixed(2)}`
const timeET = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }) : '—'
const dateLabel = (ymd: string) =>
  new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })

export function timesheetHtml(opts: { staffName: string; position: string | null; ts: Timesheet }): string {
  const { ts } = opts
  const rows = ts.lines.map(l => `
        <tr>
          <td>${dateLabel(l.date)}</td>
          <td>${esc(l.location)}</td>
          <td>${timeET(l.clock_in_at)}</td>
          <td>${timeET(l.clock_out_at)}</td>
          <td>${l.hours.toFixed(2)}</td>
          <td>${money(l.pay_rate)}</td>
          <td>${esc(l.status)}</td>
          <td>${l.status === 'Approved' ? money(l.amount) : '—'}</td>
        </tr>`).join('')
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Timesheet - ${esc(opts.staffName)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 32px; color: #1a1a1a; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      table { border-collapse: collapse; width: 100%; font-size: 13px; margin-top: 16px; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
      th { background: #f5f5f5; }
      .totals { margin-top: 20px; font-size: 14px; }
      .note { font-size: 12px; color: #666; margin-top: 16px; }
    </style>
  </head>
  <body>
    <h1>Convenience Hub of Maryland - Weekly Timesheet</h1>
    <p><strong>Staff:</strong> ${esc(opts.staffName)}${opts.position ? ` &middot; ${esc(opts.position)}` : ''}</p>
    <p><strong>Week:</strong> ${dateLabel(ts.week_start)} to ${dateLabel(ts.week_end)} &middot; <strong>Pay date:</strong> ${dateLabel(ts.pay_date)}</p>
    <table>
      <thead>
        <tr><th>Date</th><th>Job site</th><th>Clock in</th><th>Clock out</th><th>Hours</th><th>Rate</th><th>Status</th><th>Pay</th></tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="8">No shifts this week.</td></tr>'}
      </tbody>
    </table>
    <div class="totals">
      <p><strong>Approved hours:</strong> ${ts.approved_hours.toFixed(2)} &middot; <strong>Approved pay:</strong> ${money(ts.approved_pay)}</p>
      <p><strong>Hours awaiting approval:</strong> ${ts.pending_hours.toFixed(2)} (not included in pay yet)</p>
    </div>
    <p class="note">Pay is calculated only on approved shifts. Questions? Call 202-579-2944.</p>
  </body>
</html>`
}
