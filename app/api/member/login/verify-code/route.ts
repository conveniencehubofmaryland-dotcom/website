import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sbFetch } from '@/lib/shift-eligibility'
import { MEMBER_COOKIE } from '@/lib/member-session'

// Checks the emailed code and starts a 30-day member session in a secure browser cookie.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const code = typeof body?.code === 'string' ? body.code.trim() : ''
  if (!email || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Enter your email and the 6-digit code.' }, { status: 400 })
  }

  try {
    const res = await sbFetch(
      `members?email=ilike.${encodeURIComponent(email)}&select=id,status,login_code,login_code_expires_at,login_code_attempts`
    )
    const rows = res.ok ? ((await res.json()) as {
      id: string; status: string; login_code: string | null; login_code_expires_at: string | null; login_code_attempts: number
    }[]) : []
    const m = rows[0]
    if (!m || m.status !== 'active' || !m.login_code) {
      return NextResponse.json({ error: 'Invalid email or code.' }, { status: 401 })
    }

    // After 5 wrong codes, the code is void and a new one must be requested.
    if ((m.login_code_attempts || 0) >= 5) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 })
    }
    if (m.login_code !== code) {
      await sbFetch(`members?id=eq.${m.id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ login_code_attempts: (m.login_code_attempts || 0) + 1 }),
      })
      return NextResponse.json({ error: 'Invalid email or code.' }, { status: 401 })
    }
    if (!m.login_code_expires_at || new Date(m.login_code_expires_at) < new Date()) {
      return NextResponse.json({ error: 'That code has expired. Please request a new one.' }, { status: 401 })
    }

    const session = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const save = await sbFetch(`members?id=eq.${m.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        login_session_token: session,
        login_session_expires_at: expires,
        login_code: null,
        login_code_expires_at: null,
        login_code_attempts: 0,
      }),
    })
    if (!save.ok) return NextResponse.json({ error: 'Could not sign you in. Please try again.' }, { status: 500 })

    const response = NextResponse.json({ success: true })
    response.cookies.set(MEMBER_COOKIE, session, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    })
    return response
  } catch (err) {
    console.error('[member login] verify-code error:', err)
    return NextResponse.json({ error: 'Could not sign you in. Please try again.' }, { status: 500 })
  }
}
