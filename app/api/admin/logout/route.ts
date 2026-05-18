import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('chm_admin', '', { maxAge: 0, path: '/', httpOnly: true, secure: true })
  return response
}
