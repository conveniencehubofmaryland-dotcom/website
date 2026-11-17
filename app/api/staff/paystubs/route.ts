import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession } from '@/lib/shift-eligibility'
import { buildTimesheet, loadWeekShifts, lastCompletedWeekStart } from '@/lib/timesheet'

// Pay statements: the last 12 completed weeks that have approved pay, newest first.
// Built live from the shift records each time (nothing is stored).
function shiftDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  const applicant = await getApplicantBySession(req.headers.get('x-staff-token'))
  if (!applicant) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })

  const latest = lastCompletedWeekStart()
  const weeks = Array.from({ length: 12 }, (_, i) => shiftDays(latest, -7 * i))

  const sheets = await Promise.all(
    weeks.map(async weekStart => {
      const shifts = await loadWeekShifts(applicant.id, weekStart)
      return buildTimesheet(shifts, weekStart)
    })
  )

  const statements = sheets
    .filter(s => s.approved_pay > 0)
    .map(s => ({
      week_start: s.week_start,
      week_end: s.week_end,
      pay_date: s.pay_date,
      approved_pay: s.approved_pay,
    }))

  return NextResponse.json({ statements })
}
