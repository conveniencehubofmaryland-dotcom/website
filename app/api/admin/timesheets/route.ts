import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { sbFetch } from '@/lib/shift-eligibility'
import { buildTimesheet, loadWeekShifts, mondayOf, timesheetHtml } from '@/lib/timesheet'

// Admin: a staff member's timesheet for a week, as JSON or as a downloadable page (format=html).
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const applicantId = req.nextUrl.searchParams.get('applicant_id') || ''
  const week = req.nextUrl.searchParams.get('week') || ''
  if (!/^[0-9a-f-]{36}$/i.test(applicantId) || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return NextResponse.json({ error: 'applicant_id and week are required' }, { status: 400 })
  }

  const weekStart = mondayOf(week)
  const appRes = await sbFetch(`offer_letter_applicants?id=eq.${applicantId}&select=full_name,position`)
  const apps = appRes.ok ? await appRes.json() : []
  const applicant = Array.isArray(apps) ? apps[0] : null
  if (!applicant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ts = buildTimesheet(await loadWeekShifts(applicantId, weekStart), weekStart)

  if (req.nextUrl.searchParams.get('format') === 'html') {
    const html = timesheetHtml({ staffName: applicant.full_name, position: applicant.position, ts })
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Timesheet-${applicant.full_name.replace(/[^A-Za-z0-9_-]/g, '_')}-${weekStart}.html"`,
      },
    })
  }
  return NextResponse.json({ name: applicant.full_name, position: applicant.position, ...ts })
}
