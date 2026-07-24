import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendApiKey = process.env.RESEND_API_KEY

  if (!serviceRoleKey || !resendApiKey) {
    return NextResponse.json({ error: 'Service not configured.' }, { status: 500 })
  }

  try {
    const generateLinkRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        type: 'recovery',
        redirect_to: 'https://conveniencehubofmaryland.com/admin/update-password',
      }),
    })

    if (!generateLinkRes.ok) {
      return NextResponse.json({ error: 'Failed to generate reset link.' }, { status: 500 })
    }

    const { action_link } = await generateLinkRes.json()

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
        html: `<h2>Password Reset Request</h2><p>Click <a href="${action_link}">here</a> to reset your password.</p><p>Link expires in 1 hour.</p>`,
      }),
    })

    if (!emailRes.ok) {
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
