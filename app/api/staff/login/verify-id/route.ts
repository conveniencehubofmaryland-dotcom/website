import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { serviceHeaders } from '@/lib/supabase-keys'

const ELIGIBLE_STATUSES = ['orientation_completed', 'ready_to_claim_shifts']

// Staff portal sign-in with the staff ID number alone (no emailed code).
// The ID is looked up directly. A wrong ID matches no one, so wrong tries cannot be counted per person.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const staffId = String(body.staffId || '').trim().toUpperCase()

  if (!staffId || !/^[A-F0-9]{8}$/.test(staffId)) {
    return NextResponse.json({ error: 'Enter the 8-character staff ID number from your badge.' }, { status: 400 })
  }

  const wrong = NextResponse.json({ error: 'That staff ID number is not correct.' }, { status: 401 })

  try {
    const findRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?staff_id_number=eq.${encodeURIComponent(staffId)}&select=id,email,onboarding_status`,
      { headers: { ...serviceHeaders() } }
    )
    const applicants = findRes.ok ? await findRes.json() : []
    const applicant = Array.isArray(applicants) && applicants.length > 0 ? applicants[0] : null
    if (!applicant) return wrong

    if (!ELIGIBLE_STATUSES.includes(String(applicant.onboarding_status))) {
      return NextResponse.json({ error: 'Onboarding not complete. Please wait for HR approval.' }, { status: 403 })
    }

    const headers = { ...serviceHeaders(), 'Content-Type': 'application/json' }
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant.id}`

    const sessionToken = crypto.randomBytes(32).toString('hex')
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const saveRes = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        login_session_token: sessionToken,
        login_session_expires_at: sessionExpires,
      }),
    })
    if (!saveRes.ok) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    return NextResponse.json({ session_token: sessionToken, email: applicant.email })
  } catch (err) {
    console.error('[login] verify-id error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
