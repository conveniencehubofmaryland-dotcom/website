import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Check if user is logged in as admin (verify the session cookie exists)
  const adminToken = req.cookies.get('chm_admin')?.value

  if (!adminToken) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin login required.' },
      { status: 401 }
    )
  }

  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Check if service role key is available
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
    return NextResponse.json(
      { error: 'Password reset feature is not configured.' },
      { status: 500 }
    )
  }

  try {
    // Use Supabase admin API to generate recovery link
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        type: 'recovery',
        redirect_to: 'https://conveniencehubofmaryland.com/admin/update-password',
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Supabase admin generate link error:', error)

      if (res.status === 404) {
        return NextResponse.json(
          { error: 'User not found.' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: error.message ?? 'Failed to generate reset link.' },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Return the action link for admin to send manually
    return NextResponse.json({
      success: true,
      action_link: data.action_link,
      email,
      message: 'Recovery link generated. Share this link with the user via secure channel.',
    })
  } catch (err) {
    console.error('Admin password reset error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
