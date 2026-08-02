import { NextRequest, NextResponse } from 'next/server'
import { sendUserEmail } from '@/lib/email'

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { applicant_id } = body

  if (!applicant_id) {
    return NextResponse.json({ error: 'applicant_id required' }, { status: 400 })
  }

  try {
    // Fetch applicant
    const appRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const appData = await appRes.json()
    if (!appData || appData.length === 0) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }
    const applicant = appData[0]

    // Update status to ready_to_claim_shifts
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
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!updateRes.ok) {
      console.error('[mark-ready] Update failed:', await updateRes.text())
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    // Send email to applicant
    const emailHtml = `
      <p>Dear ${applicant.full_name},</p>
      <p>Great news! Your onboarding is complete and you are now ready to claim shifts with Convenience Hub of Maryland.</p>
      <p><strong>Your Position:</strong> ${applicant.position}</p>
      <p><strong>Next Step:</strong> Sign in to browse and claim shifts:</p>
      <p style="margin: 20px 0;">
        <a href="https://conveniencehubofmaryland.com/staff/claim-shifts-login" style="background: #E8192C; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">
          Sign In to Claim Shifts
        </a>
      </p>
      <p><strong>Remember:</strong></p>
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
      'Ready to Claim Shifts – Convenience Hub of Maryland',
      emailHtml
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[mark-ready] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
