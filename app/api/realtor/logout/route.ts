import { NextResponse } from 'next/server'
import { REALTOR_COOKIE } from '@/lib/realtor'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(REALTOR_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
