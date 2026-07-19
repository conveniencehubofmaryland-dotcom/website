import { NextRequest, NextResponse } from 'next/server'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { applicant_id, position, salary_annual, start_date, benefits_summary } = body

  if (!applicant_id || !position || !salary_annual || !start_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Fetch applicant details
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

    // Generate unique signing token
    const sign_token = crypto.randomUUID()

    // Create offer letter record
    const { error: insertError } = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters`,
      {
        method: 'POST',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
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
    ).then(r => r.json())

    if (insertError) {
      console.error('[offer-letters] Supabase insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to create offer letter' }, { status: 500 })
    }

    // Update applicant status to 'sent'
    const statusRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
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
        <li><strong>Employment Type:</strong> Full-Time</li>
        <li><strong>Hours:</strong> 40 hours per week</li>
        <li><strong>Hourly Rate:</strong> $${salary_annual}/hour, paid weekly every Friday</li>
      </ul>

      <h3>COMPENSATION & BENEFITS</h3>
      <ul>
        <li><strong>Weekly Pay:</strong> Paid every Friday for work performed in the prior week</li>
        <li><strong>401(k) Retirement Plan:</strong> Eligible after 90 days of employment</li>
      </ul>

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
      `Offer letter sent to ${applicant.full_name} for ${position} position at $${salary_annual}/hour, starting ${new Date(start_date).toLocaleDateString()}.`
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[offer-letters] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
