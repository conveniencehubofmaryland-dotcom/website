import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  // Validate inputs
  if (!token) {
    return NextResponse.json({ error: 'Invalid or missing reset token.' }, { status: 400 })
  }

  if (!password) {
    return NextResponse.json({ error: 'Password is required.' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Supabase update user error:', error)
      
      // Check if token is expired
      if (res.status === 401 || error.error_code === 'expired_token') {
        return NextResponse.json(
          { error: 'Your reset link has expired. Please request a new one.' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: error.message ?? 'Failed to update password.' },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Password update error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
