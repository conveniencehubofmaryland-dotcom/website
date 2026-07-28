import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code required' }, { status: 400 })
  }

  try {
    // Find applicant
    const findRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?email=eq.${encodeURIComponent(email)}&select=id,login_code,login_code_expires_at`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    const applicants = await findRes.json()
    if (!applicants || applicants.length === 0) {
      return NextResponse.json({ error: 'Invalid email or code' }, { status: 401 })
    }

    const applicant = applicants[0]

    // Verify code
    if (applicant.login_code !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
    }

    // Check expiration
    if (new Date(applicant.login_code_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 401 })
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

    // Save session
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant.id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login_session_token: sessionToken,
          login_session_expires_at: sessionExpires,
          login_code: null,
          login_code_expires_at: null,
        }),
      }
    )

    if (!updateRes.ok) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    console.log('[login] Session created for:', email)
    return NextResponse.json({ session_token: sessionToken })
  } catch (err) {
    console.error('[login] Verify error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
