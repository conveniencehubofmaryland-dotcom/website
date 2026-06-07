import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json(
      { error: 'Token and password are required.' },
      { status: 400 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Supabase update password error:', error)
      return NextResponse.json(
        { error: error.message ?? 'Failed to update password.' },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update password error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
