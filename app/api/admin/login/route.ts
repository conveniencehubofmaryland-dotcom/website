import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  const { access_token, expires_in } = await res.json()

  const response = NextResponse.json({ success: true })
  response.cookies.set('chm_admin', access_token, {
    httpOnly: true,
    secure:   true,
    sameSite: 'lax',
    maxAge:   expires_in ?? 3600,
    path:     '/',
  })
  return response
}
