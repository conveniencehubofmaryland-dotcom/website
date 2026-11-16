import { NextRequest, NextResponse } from 'next/server'
import { sbFetch } from '@/lib/shift-eligibility'
import { makeTrainingToken } from '@/lib/training-token'

const TRAINING_STATUSES = ['orientation_signed', 'orientation_completed', 'ready_to_claim_shifts']

export async function POST(req: NextRequest) {
  const { email, code } = await req.json().catch(() => ({}))
  const clean = String(email || '').trim()
  const enteredCode = String(code || '').trim()
  if (!clean || !enteredCode) {
    return NextResponse.json({ error: 'Please enter your email and the code.' }, { status: 400 })
  }

  try {
    const res = await sbFetch(
      `offer_letter_applicants?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,phone,position,onboarding_status,login_code,login_code_expires_at,login_code_attempts`
    )
    const rows = res.ok ? await res.json() : []
    const applicant = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
    if (!applicant || !TRAINING_STATUSES.includes(String(applicant.onboarding_status))) {
      return NextResponse.json({ error: 'That code is not valid. Please request a new one.' }, { status: 401 })
    }

    const attempts = Number(applicant.login_code_attempts) || 0
    if (attempts >= 5) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 })
    }
    if (!applicant.login_code || applicant.login_code !== enteredCode) {
      await sbFetch(`offer_letter_applicants?id=eq.${applicant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ login_code_attempts: attempts + 1 }),
      })
      return NextResponse.json({ error: 'That code is not correct.' }, { status: 401 })
    }
    if (!applicant.login_code_expires_at || new Date(applicant.login_code_expires_at) < new Date()) {
      return NextResponse.json({ error: 'That code has expired. Please request a new one.' }, { status: 401 })
    }

    // Use the code once.
    await sbFetch(`offer_letter_applicants?id=eq.${applicant.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ login_code: null, login_code_expires_at: null, login_code_attempts: 0 }),
    })

    return NextResponse.json({
      training_token: makeTrainingToken(clean),
      full_name: applicant.full_name || '',
      phone: applicant.phone || '',
      position: applicant.position || '',
    })
  } catch (err) {
    console.error('[training/verify-code] Error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
