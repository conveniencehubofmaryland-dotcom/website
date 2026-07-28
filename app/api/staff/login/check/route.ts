import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 })
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?login_session_token=eq.${token}&select=id,full_name,email,onboarding_status`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    const data = await res.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const applicant = data[0]

    // Check expiration
    if (new Date(applicant.login_session_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    return NextResponse.json({
      id: applicant.id,
      full_name: applicant.full_name,
      email: applicant.email,
    })
  } catch (err) {
    console.error('[login-check] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
