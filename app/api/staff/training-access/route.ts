import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession, sbFetch } from '@/lib/shift-eligibility'
import { verifyTrainingToken } from '@/lib/training-token'

// Applicants who have finished orientation may train.
const TRAINING_STATUSES = ['orientation_signed', 'offer_signed', 'orientation_completed', 'ready_to_claim_shifts']

async function applicantByEmail(email: string): Promise<{ position: string | null; email: string } | null> {
  const res = await sbFetch(
    `offer_letter_applicants?email=ilike.${encodeURIComponent(email)}&select=id,email,position,onboarding_status`
  )
  if (!res.ok) return null
  const rows = await res.json()
  if (!Array.isArray(rows) || rows.length === 0) return null
  const row = rows[0]
  if (!TRAINING_STATUSES.includes(String(row.onboarding_status))) return null
  return { position: row.position ?? null, email: row.email }
}

// Staff: the applicant's position and whether the other positions are unlocked.
// Other positions unlock once the FIRST module of the applied position is passed.
// Identified by the sign-in token, or by the training token from the emailed code.
export async function GET(req: NextRequest) {
  const token = req.headers.get('x-staff-token')
  const trainingToken = req.headers.get('x-training-token')

  let applicant: { position: string | null; email: string } | null = null
  try {
    if (token) {
      applicant = await getApplicantBySession(token)
    } else {
      const verifiedEmail = verifyTrainingToken(trainingToken)
      if (verifiedEmail) applicant = await applicantByEmail(verifiedEmail)
    }
  } catch {
    return NextResponse.json({ error: 'We could not check your details right now. Please try again.' }, { status: 503 })
  }
  if (!applicant) {
    return NextResponse.json({ error: 'Please sign in or enter the email you applied with.' }, { status: 401 })
  }

  const position = applicant.position || ''
  const modsRes = position
    ? await sbFetch(`training_modules?position=eq.${encodeURIComponent(position)}&select=id,created_at&order=created_at.asc`)
    : null
  const mods = modsRes && modsRes.ok ? ((await modsRes.json()) as { id: string }[]) : []
  const firstModuleId = mods.length > 0 ? mods[0].id : null

  const progRes = await sbFetch(
    `staff_module_progress?staff_email=ilike.${encodeURIComponent(applicant.email)}&status=eq.completed&select=module_id`
  )
  const progress = progRes.ok ? ((await progRes.json()) as { module_id: string }[]) : []
  const passed = new Set(progress.map(p => p.module_id))

  return NextResponse.json({
    position,
    first_module_id: firstModuleId,
    passed_module_ids: Array.from(passed),
    other_positions_unlocked: firstModuleId === null ? true : passed.has(firstModuleId),
  })
}
