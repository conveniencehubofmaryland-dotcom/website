import { NextRequest, NextResponse } from 'next/server'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'
import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const denied = await requireAdmin(req)
  if (denied) return denied

  const body = await req.json()
  const { applicant_id, position, salary_annual, start_date, benefits_summary } = body

  if (!applicant_id || !position || !start_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Fetch applicant details
    const appRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        headers: {
          ...serviceHeaders(),
        },
      }
    )

    const appData = await appRes.json()
    if (!appData || appData.length === 0) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    const applicant = appData[0]

    // Generate unique signing token
    const sign_token = crypto.randomUUID()

    // Create offer letter record
const insertRes = await fetch(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters`,
  {
    method: 'POST',
    headers: {
      ...serviceHeaders(),
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      applicant_id,
      position,
      salary_annual,
      start_date,
      benefits_summary: benefits_summary || null,
      pdf_url: null,
      sign_token,
      status: 'sent',
    }),
  }
)

if (!insertRes.ok) {
  const errorBody = await insertRes.text()
  console.error('[offer-letters] Supabase insert failed:', errorBody)
  return NextResponse.json({ error: 'Failed to create offer letter' }, { status: 500 })
}
    // Update applicant status to 'sent'
    const statusRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        method: 'PATCH',
        headers: {
          ...serviceHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'sent', updated_at: new Date().toISOString() }),
      }
    )

    if (!statusRes.ok) {
      console.error('[offer-letters] Status update failed:', await statusRes.text())
    }

    // Send offer letter email to applicant
    const offerHtml = `
      <p>Dear ${applicant.full_name},</p>
      <p>We are pleased to offer you the position of <strong>${position}</strong> at Convenience Hub of Maryland, effective <strong>${new Date(start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
      
      <h3>POSITION DETAILS</h3>
      <ul>
        <li><strong>Position:</strong> ${position}</li>
        <li><strong>Start Date:</strong> ${new Date(start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</li>
        <li><strong>Engagement Type:</strong> Independent Contractor (IRS Form 1099)</li>
      </ul>

      <h3>COMPENSATION</h3>
      <p>You are paid under the CHM Contractor Compensation Structure, effective October 22, 2026. Paid every Friday for work performed in the prior week. The full tier shares and commercial fee bands are in your offer letter.</p>

      <h3>NEXT STEPS</h3>
      <ol>
        <li><a href="https://conveniencehubofmaryland.com/offer/sign/${sign_token}" style="color: #d73a3a; font-weight: bold;">Review and electronically sign this offer letter</a></li>
        <li>Complete all required training modules</li>
        <li>Bring government ID and proof of work authorization on Day 1</li>
      </ol>

      <p>We are excited to have you join the team!</p>
      <p>Convenience Hub of Maryland<br/>202-579-2944</p>
    `

    await sendUserEmail(
      applicant.email,
      'Offer Letter – Convenience Hub of Maryland',
      offerHtml
    )

    // Send admin notification
    await sendAdminEmail(
      `New Offer Letter Sent: ${applicant.full_name}`,
      `Offer letter sent to ${applicant.full_name} for ${position} position, starting ${new Date(start_date).toLocaleDateString()}.`
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[offer-letters] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
