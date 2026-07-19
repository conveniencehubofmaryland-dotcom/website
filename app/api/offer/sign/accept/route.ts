import { NextRequest, NextResponse } from 'next/server'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, offer_id } = body

  if (!token || !offer_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const now = new Date().toISOString()
    console.log('[accept] Processing token:', token, 'offer_id:', offer_id)

    // Update offer to mark as signed
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters?id=eq.${offer_id}&sign_token=eq.${token}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signed_at: now,
          sign_token: null,
        }),
      }
    )

    const updateText = await updateRes.text()
    console.log('[accept] Update response status:', updateRes.status)

    if (!updateRes.ok) {
      console.error('[accept] Update failed:', updateText)
      return NextResponse.json({ error: 'Failed to sign offer' }, { status: 500 })
    }

    // Fetch offer and applicant details for email
    const fetchRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters?id=eq.${offer_id}&select=*,offer_letter_applicants(full_name,email)`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const fetchText = await fetchRes.text()
    console.log('[accept] Fetch response status:', fetchRes.status)

    if (!fetchRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 })
    }

    const data = JSON.parse(fetchText)
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    const offer = data[0]
    const applicant = offer.offer_letter_applicants

    // Send confirmation email to applicant
    const confirmationHtml = `
      <p>Dear ${applicant.full_name},</p>
      <p>Thank you for accepting your offer to join Convenience Hub of Maryland!</p>
      <p><strong>Position:</strong> ${offer.position}<br/>
      <strong>Start Date:</strong> ${new Date(offer.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Complete all required training modules: <a href="https://conveniencehubofmaryland.com/staff/training-modules">Training Modules</a></li>
        <li>Prepare required documents for your first day (ID, proof of work authorization)</li>
        <li>Claim your first shift: <a href="https://conveniencehubofmaryland.com/staff/available-shifts">Available Shifts</a></li>
      </ul>
      <p>We are excited to have you on the team!</p>
      <p>Convenience Hub of Maryland<br/>202-579-2944</p>
    `

    await sendUserEmail(
      applicant.email,
      'Offer Accepted – Welcome to CHM!',
      confirmationHtml
    )

    // Send notification to admin
    await sendAdminEmail(
      `Offer Accepted: ${applicant.full_name}`,
      `${applicant.full_name} has accepted their offer for ${offer.position}. Ready to onboard!`
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[accept] Exception:', err)
    return NextResponse.json({ error: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 500 })
  }
}
