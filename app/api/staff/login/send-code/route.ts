import { NextRequest, NextResponse } from 'next/server'
import { sendUserEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    // Find applicant by email
    const findRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?email=eq.${encodeURIComponent(email)}&select=id,full_name,onboarding_status`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    if (!findRes.ok) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    const applicants = await findRes.json()
    if (!applicants || applicants.length === 0) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    const applicant = applicants[0]

    // Check if onboarding is complete
    // Accept both 'orientation_completed' and 'ready_to_claim_shifts' as valid states
    if (applicant.onboarding_status !== 'orientation_completed' && 
        applicant.onboarding_status !== 'ready_to_claim_shifts') {
      return NextResponse.json(
        { error: 'Onboarding not complete. Please wait for HR approval.' },
        { status: 403 }
      )
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    // Save code to database
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant.id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login_code: code,
          login_code_expires_at: expiresAt,
        }),
      }
    )

    if (!updateRes.ok) {
      console.error('Failed to save code')
      return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
    }

    // Send email with code
    const emailHtml = `
      <p>Hi ${applicant.full_name},</p>
      <p>Your verification code is:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 20px 0;">${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <p>Convenience Hub of Maryland<br/>202-579-2944</p>
    `

    await sendUserEmail(email, 'Your Verification Code', emailHtml)

    console.log('[login] Code sent to:', email)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[login] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
