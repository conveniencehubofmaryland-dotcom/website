import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendApiKey = process.env.RESEND_API_KEY

  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
    return NextResponse.json(
      { error: 'Password reset feature is not configured.' },
      { status: 500 }
    )
  }

  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not set')
    return NextResponse.json(
      { error: 'Email service is not configured.' },
      { status: 500 }
    )
  }

  try {
    // Step 1: Generate recovery link from Supabase
    const generateLinkRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/generate_link`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'recovery',
          redirect_to: 'https://conventiencehubofmaryland.com/admin/update-password',
        }),
      }
    )

    if (!generateLinkRes.ok) {
      const error = await generateLinkRes.json()
      console.error('Supabase generate_link error:', error)
      return NextResponse.json(
        { error: 'Failed to generate reset link.' },
        { status: generateLinkRes.status }
      )
    }

    const { action_link } = await generateLinkRes.json()

    // Step 2: Send email via Resend with the recovery link
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'team@conveniencehubofmaryland.com',
        to: email,
        subject: 'Reset Your Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${action_link}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        `,
      }),
    })

    if (!emailRes.ok) {
      const error = await emailRes.json()
      console.error('Resend email error:', error)
      return NextResponse.json(
        { error: 'Failed to send reset email.' },
        { status: emailRes.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Password reset error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
