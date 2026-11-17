import { NextRequest, NextResponse } from 'next/server'
import { sbFetch } from '@/lib/shift-eligibility'
import { makeTrainingToken } from '@/lib/training-token'

const TRAINING_STATUSES = ['orientation_signed', 'offer_signed', 'orientation_completed', 'ready_to_claim_shifts']
const MAX_ATTEMPTS = 5

// Training sign-in with email + staff ID number (no emailed code). Same result as the emailed code.
export async function POST(req: NextRequest) {
  const { email, staffId } = await req.json().catch(() => ({}))
  const clean = String(email || '').trim()
  const enteredId = String(staffId || '').trim().toUpperCase()
  if (!clean || !enteredId) {
    return NextResponse.json({ error: 'Please enter your email and staff ID number.' }, { status: 400 })
  }

  const wrong = NextResponse.json({ error: 'The email or staff ID number is not correct.' }, { status: 401 })

  try {
    const res = await sbFetch(
      `offer_letter_applicants?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,phone,position,onboarding_status,staff_id_number,id_login_attempts`
    )
    const rows = res.ok ? await res.json() : []
    const applicant = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    if (!applicant) return wrong
    if (!TRAINING_STATUSES.includes(String(applicant.onboarding_status))) {
      return NextResponse.json({ error: 'Training is not open for this email yet.' }, { status: 403 })
    }

    const attempts = Number(applicant.id_login_attempts) || 0
    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many attempts. Please sign in with the emailed code instead.' }, { status: 429 })
    }

    if (!applicant.staff_id_number || String(applicant.staff_id_number).toUpperCase() !== enteredId) {
      await sbFetch(`offer_letter_applicants?id=eq.${applicant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ id_login_attempts: attempts + 1 }),
      })
      return wrong
    }

    await sbFetch(`offer_letter_applicants?id=eq.${applicant.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ id_login_attempts: 0 }),
    })

    return NextResponse.json({
      training_token: makeTrainingToken(clean),
      full_name: applicant.full_name || '',
      phone: applicant.phone || '',
      position: applicant.position || '',
    })
  } catch (err) {
    console.error('[training/verify-id] Error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
