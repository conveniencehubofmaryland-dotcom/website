import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendUserEmail } from '@/lib/email'
import crypto from 'crypto'

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { applicant_id } = body

  if (!applicant_id) {
    return NextResponse.json({ error: 'Missing applicant_id' }, { status: 400 })
  }

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('chm_admin')?.value ?? ''

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date().toISOString()

    // Fetch applicant details first
    const fetchRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}&select=full_name,email,position`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    if (!fetchRes.ok) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    const applicantData = await fetchRes.json()
    if (!applicantData || applicantData.length === 0) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    const applicant = applicantData[0]

    // Generate secure token (valid for 30 days)
    const claimToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Update status + token
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboarding_status: 'ready_to_claim_shifts',
          claim_shift_token: claimToken,
          claim_shift_token_expires_at: expiresAt,
          updated_at: now,
        }),
      }
    )

    if (!updateRes.ok) {
      const error = await updateRes.text()
      console.error('[mark-ready] Error:', error)
      return NextResponse.json({ error: 'Failed to update applicant' }, { status: 500 })
    }

    // Send email with claim shift link
    const claimLink = `https://conveniencehubofmaryland.com/staff/claim-shifts-login`

    const emailHtml = `
      <p>Dear ${applicant.full_name},</p>
      <p>Great news! Your onboarding is complete and you are now ready to claim shifts with Convenience Hub of Maryland.</p>
      <p><strong>Your Position:</strong> ${applicant.position}</p>
      <p><strong>Next Step:</strong> Sign in to browse and claim shifts:</p>
      <p><a href="${claimLink}" style="display: inline-block; background-color: #c41e3a; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; border-radius: 4px;">Sign In to Claim Shifts</a></p>
      <p>Remember:</p>
      <ul>
        <li>You only work shifts you actively claim through the portal</li>
        <li>Shift confirmations will be sent via email</li>
        <li>Check the portal regularly for new shift opportunities</li>
      </ul>
      <p>Welcome to the team! If you have any questions, contact us at 202-579-2944 (Mon–Sat, 9 AM–9 PM).</p>
      <p>Convenience Hub of Maryland<br/>202-579-2944</p>
    `

    await sendUserEmail(
      applicant.email,
      'Ready to Claim Shifts – Your CHM Journey Begins!',
      emailHtml
    )

    console.log('[mark-ready] Applicant marked ready and email sent:', applicant_id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[mark-ready] Exception:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
