import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession, sbFetch } from '@/lib/shift-eligibility'

// Staff: the applicant's position and whether every module for that position is passed.
// Other positions unlock only after this is true.
export async function GET(req: NextRequest) {
  let applicant
  try {
    applicant = await getApplicantBySession(req.headers.get('x-staff-token'))
  } catch {
    return NextResponse.json({ error: 'We could not check your sign-in right now. Please try again.' }, { status: 503 })
  }
  if (!applicant) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })

  const position = applicant.position || ''
  const modsRes = position
    ? await sbFetch(`training_modules?position=eq.${encodeURIComponent(position)}&select=id`)
    : null
  const mods = modsRes && modsRes.ok ? ((await modsRes.json()) as { id: string }[]) : []

  const progRes = await sbFetch(
    `staff_module_progress?staff_email=ilike.${encodeURIComponent(applicant.email)}&status=eq.completed&select=module_id`
  )
  const progress = progRes.ok ? ((await progRes.json()) as { module_id: string }[]) : []
  const passed = new Set(progress.map(p => p.module_id))

  return NextResponse.json({
    position,
    own_position_modules: mods.map(m => m.id),
    passed_module_ids: Array.from(passed),
    own_position_complete: mods.every(m => passed.has(m.id)),
  })
}
