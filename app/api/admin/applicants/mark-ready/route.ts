import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sendUserEmailHtml } from '@/lib/email'
import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'
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
    const denied = await requireAdmin(req)
    if (denied) return denied

    const now = new Date().toISOString()

    // Fetch applicant details first
    const fetchRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}&select=full_name,email,position`,
      {
        headers: {
          ...serviceHeaders(),
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

    // Gate: the W-9 must be on file before the applicant can claim shifts.
    const w9Res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/w9_forms?applicant_id=eq.${applicant_id}&select=id&limit=1`,
      { headers: { ...serviceHeaders() } }
    )
    const w9Rows = w9Res.ok ? await w9Res.json() : []
    if (!Array.isArray(w9Rows) || w9Rows.length === 0) {
      return NextResponse.json(
        { error: 'The applicant has not submitted their IRS Form W-9 yet.' },
        { status: 400 }
      )
    }

    // Generate secure token (valid for 30 days)
    const claimToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Update status + token
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        method: 'PATCH',
        headers: {
          ...serviceHeaders(),
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

    const claimLink = 'https://conveniencehubofmaryland.com/staff/claim-shifts-login'
    const firstName = String(applicant.full_name || '').split(' ')[0] || 'there'
    const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #c41e3a; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0;">Congratulations, ${firstName}!</h1>
      </div>
      <div style="padding: 30px; color: #1a1a1a; line-height: 1.6;">
        <p>You have completed the entire Convenience Hub of Maryland onboarding process. Welcome to the team!</p>
        <p><strong>What you finished:</strong></p>
        <ul>
          <li>Reviewed How It Works and started your onboarding</li>
          <li>Submitted your welcome profile and background check</li>
          <li>Signed your offer letter and orientation</li>
          <li>Completed your required training modules</li>
        </ul>
        <p><strong>Your position:</strong> ${applicant.position || 'Staff'}</p>
        <p>You can now browse and claim shifts in the staff portal:</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${claimLink}" style="display: inline-block; background-color: #c41e3a; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 4px;">Claim Your Shifts</a>
        </p>
        <p><strong>Remember:</strong></p>
        <ul>
          <li>You only work shifts you actively claim through the portal</li>
          <li>Shift confirmations will be sent by email</li>
          <li>Check the portal regularly for new opportunities</li>
        </ul>
        <p>Questions? Call or text 202-579-2944 (Mon–Sat 7 AM–11 PM, Sun 9 AM–9 PM).</p>
        <p><strong>The CHM Team</strong></p>
      </div>
    </div>`

    // The status is already saved, so an email failure is logged instead of shown as a failure.
    try {
      await sendUserEmailHtml(
        applicant.email,
        'Congratulations – You Are Ready to Claim Shifts!',
        emailHtml
      )
    } catch (emailErr) {
      console.error('[mark-ready] Congratulations email failed:', emailErr)
    }

    console.log('[mark-ready] Applicant marked ready and email sent:', applicant_id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[mark-ready] Exception:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
