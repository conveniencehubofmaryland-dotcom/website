import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { sbFetch, type ShiftRow } from '@/lib/shift-eligibility'
import { sendUserEmailWithAttachment } from '@/lib/email'
import { buildTimesheet, lastCompletedWeekStart, loadWeekShifts, timesheetHtml } from '@/lib/timesheet'

// Emails each staff member their timesheet for the last completed week (Monday to Sunday).
// Run every Friday by the scheduler with the x-cron-secret header, or by an admin with the admin cookie.
export async function GET(req: NextRequest) {
  return run(req)
}

export async function POST(req: NextRequest) {
  return run(req)
}

async function run(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const isCron = !!secret && req.headers.get('x-cron-secret') === secret
  if (!isCron) {
    const denied = await requireAdmin(req)
    if (denied) return denied
  }

  const weekStart = lastCompletedWeekStart()
  const weekEnd = new Date(`${weekStart}T12:00:00Z`)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)
  const weekEndYmd = weekEnd.toISOString().slice(0, 10)

  const res = await sbFetch(
    `shifts?applicant_id=not.is.null&date=gte.${weekStart}&date=lte.${weekEndYmd}&select=applicant_id`
  )
  if (!res.ok) return NextResponse.json({ error: 'Could not load shifts' }, { status: 500 })
  const rows = (await res.json()) as { applicant_id: string }[]
  const applicantIds = Array.from(new Set(rows.map(r => r.applicant_id)))

  let sent = 0
  const failed: string[] = []
  for (const applicantId of applicantIds) {
    try {
      const appRes = await sbFetch(`offer_letter_applicants?id=eq.${applicantId}&select=full_name,email,position`)
      const apps = appRes.ok ? await appRes.json() : []
      const applicant = Array.isArray(apps) ? apps[0] : null
      if (!applicant?.email) continue

      const shifts: ShiftRow[] = await loadWeekShifts(applicantId, weekStart)
      const ts = buildTimesheet(shifts, weekStart)
      if (ts.lines.length === 0) continue

      const html = timesheetHtml({ staffName: applicant.full_name, position: applicant.position, ts })
      await sendUserEmailWithAttachment(
        applicant.email,
        `Your Timesheet: ${weekStart} to ${ts.week_end}`,
        `Hi ${applicant.full_name}, your timesheet for ${weekStart} to ${ts.week_end} is attached. Approved pay: $${ts.approved_pay.toFixed(2)} (${ts.approved_hours.toFixed(2)} hours), paid on ${ts.pay_date}. You can also view it in the staff portal: <a href="https://conveniencehubofmaryland.com/staff/timesheets">My Timesheets</a>.`,
        { filename: `Timesheet-${weekStart}.html`, content: html },
      )
      sent++
    } catch (err) {
      console.error('[weekly-timesheets] failed for', applicantId, err)
      failed.push(applicantId)
    }
  }

  return NextResponse.json({ week_start: weekStart, sent, failed: failed.length })
}
