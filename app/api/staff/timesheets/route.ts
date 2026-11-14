import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession } from '@/lib/shift-eligibility'
import { buildTimesheet, loadWeekShifts, lastCompletedWeekStart, mondayOf } from '@/lib/timesheet'

// Staff: their own timesheet for a week (defaults to the last completed week).
export async function GET(req: NextRequest) {
  const applicant = await getApplicantBySession(req.headers.get('x-staff-token'))
  if (!applicant) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })

  const requested = req.nextUrl.searchParams.get('week')
  const weekStart = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) ? mondayOf(requested) : lastCompletedWeekStart()
  const shifts = await loadWeekShifts(applicant.id, weekStart)
  return NextResponse.json({ name: applicant.full_name, ...buildTimesheet(shifts, weekStart) })
}
