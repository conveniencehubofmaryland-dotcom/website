import { NextRequest, NextResponse } from 'next/server'
import { sbFetch } from '@/lib/shift-eligibility'
import { MEMBER_COOKIE } from '@/lib/member-session'

// Ends the member session on this browser.
export async function POST(req: NextRequest) {
  const token = req.cookies.get(MEMBER_COOKIE)?.value ?? ''
  if (/^[0-9a-f]{64}$/.test(token)) {
    await sbFetch(`members?login_session_token=eq.${token}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ login_session_token: null, login_session_expires_at: null }),
    }).catch(() => {})
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set(MEMBER_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return response
}
