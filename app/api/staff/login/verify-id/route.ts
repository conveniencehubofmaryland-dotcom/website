import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { serviceHeaders } from '@/lib/supabase-keys'

const ELIGIBLE_STATUSES = ['orientation_completed', 'ready_to_claim_shifts']
const MAX_ATTEMPTS = 5

// Staff portal sign-in with email + staff ID number (no emailed code).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').trim()
  const staffId = String(body.staffId || '').trim().toUpperCase()

  if (!email || !staffId) {
    return NextResponse.json({ error: 'Enter your email and staff ID number.' }, { status: 400 })
  }

  const wrong = NextResponse.json({ error: 'The email or staff ID number is not correct.' }, { status: 401 })

  try {
    const findRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?email=ilike.${encodeURIComponent(email)}&select=id,full_name,email,onboarding_status,staff_id_number,id_login_attempts`,
      { headers: { ...serviceHeaders() } }
    )
    const applicants = findRes.ok ? await findRes.json() : []
    const applicant = Array.isArray(applicants) && applicants.length > 0 ? applicants[0] : null
    if (!applicant) return wrong

    if (!ELIGIBLE_STATUSES.includes(String(applicant.onboarding_status))) {
      return NextResponse.json({ error: 'Onboarding not complete. Please wait for HR approval.' }, { status: 403 })
    }

    const attempts = Number(applicant.id_login_attempts) || 0
    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many attempts. Sign in with the email code instead.' }, { status: 429 })
    }

    const headers = { ...serviceHeaders(), 'Content-Type': 'application/json' }
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant.id}`

    if (!applicant.staff_id_number || String(applicant.staff_id_number).toUpperCase() !== staffId) {
      await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ id_login_attempts: attempts + 1 }) })
      return wrong
    }

    const sessionToken = crypto.randomBytes(32).toString('hex')
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const saveRes = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        login_session_token: sessionToken,
        login_session_expires_at: sessionExpires,
        id_login_attempts: 0,
      }),
    })
    if (!saveRes.ok) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({ session_token: sessionToken })
  } catch (err) {
    console.error('[login] verify-id error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
