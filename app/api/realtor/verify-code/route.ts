import { NextRequest, NextResponse } from 'next/server'
import { svcSelect, svcPatch, sha256Hex, randomHex, REALTOR_COOKIE } from '@/lib/realtor'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const code = String(body.code || '').trim()
  if (!email || !code) return NextResponse.json({ error: 'Enter the code from your email.' }, { status: 400 })

  const rows = await svcSelect<{ id: string; login_code_hash: string | null; login_code_expires_at: string | null }>('realtors', {
    email: `eq.${email}`, approved: 'eq.true', select: 'id,login_code_hash,login_code_expires_at', limit: '1',
  })
  const r = rows[0]
  const expired = !r?.login_code_expires_at || new Date(r.login_code_expires_at).getTime() <= Date.now()
  if (!r || !r.login_code_hash || expired || r.login_code_hash !== (await sha256Hex(code))) {
    return NextResponse.json({ error: 'That code is wrong or has expired. Ask for a new one.' }, { status: 401 })
  }

  const token = randomHex(32)
  await svcPatch('realtors', { id: `eq.${r.id}` }, {
    login_code_hash: null,
    login_code_expires_at: null,
    session_token_hash: await sha256Hex(token),
    session_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    session_last_active_at: new Date().toISOString(),
  })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(REALTOR_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60 })
  return res
}
