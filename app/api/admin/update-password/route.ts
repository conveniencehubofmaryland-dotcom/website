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
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
    return NextResponse.json(
      { error: 'Password update is not configured.' },
      { status: 500 }
    )
  }

  try {
    // First, verify the token to get the user
    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link.' },
        { status: 401 }
      )
    }

    const user = await verifyRes.json()

    // Now update the password using admin API
    const updateRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${user.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ password }),
      }
    )

    if (!updateRes.ok) {
      const error = await updateRes.json()
      console.error('Supabase admin update error:', error)
      return NextResponse.json(
        { error: 'Failed to update password.' },
        { status: updateRes.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update password error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
