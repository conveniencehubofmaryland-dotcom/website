import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const res = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.staff_portal_password`, {
      headers: { apikey: supabaseKey as string, Authorization: `Bearer ${supabaseKey as string}` },
    })

    const data = await res.json()
    const correctPassword = data[0]?.value

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('staff_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
