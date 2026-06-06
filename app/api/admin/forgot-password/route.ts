import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        redirect_to: 'https://conveniencehubofmaryland.com/admin/update-password',
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Supabase recover error:', error)
      return NextResponse.json(
        { error: 'Failed to send reset email. Please check your email address.' },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Password reset error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
