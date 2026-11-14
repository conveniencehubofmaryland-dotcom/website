import { NextRequest, NextResponse } from 'next/server'
import { sendAdminEmail, sendUserEmailWithAttachment } from '@/lib/email'
import { buildOfferLetterHtml } from '@/lib/offer-letter'
import { serviceHeaders } from '@/lib/supabase-keys'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, offer_id, signature_name, signature_image } = body

  if (!token || !offer_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!signature_name || !String(signature_name).trim()) {
    return NextResponse.json({ error: 'Please type your full name.' }, { status: 400 })
  }
  // The drawn signature is a PNG image from the signing box; limit its size.
  const imageText = typeof signature_image === 'string' ? signature_image : ''
  if (!imageText.startsWith('data:image/png;base64,') || imageText.length > 300000) {
    return NextResponse.json({ error: 'Please draw your signature in the box.' }, { status: 400 })
  }

  try {
    const now = new Date().toISOString()
    console.log('[accept] Processing token:', token, 'offer_id:', offer_id)

    // Update offer to mark as signed
    const updateRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters?id=eq.${encodeURIComponent(String(offer_id))}&sign_token=eq.${encodeURIComponent(String(token))}`,
      {
        method: 'PATCH',
        headers: {
          ...serviceHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signed_at: now,
          signature_name: String(signature_name).trim(),
          signature_image: imageText,
          sign_token: null,
          status: 'signed',
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
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters?id=eq.${encodeURIComponent(String(offer_id))}&select=*,offer_letter_applicants(id,full_name,email)`,
      {
        headers: {
          ...serviceHeaders(),
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

    // Update applicant onboarding_status to 'offer_signed'
    const appStatusRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant.id}`,
      {
        method: 'PATCH',
        headers: {
          ...serviceHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ onboarding_status: 'offer_signed', updated_at: now }),
      }
    )

    if (!appStatusRes.ok) {
      console.error('[accept] Applicant status update failed:', await appStatusRes.text())
    }

    // Send confirmation email to applicant
    const confirmationHtml = `
      <p>Dear ${applicant.full_name},</p>
      <p>Thank you for accepting your offer to join Convenience Hub of Maryland!</p>
      <p><strong>Position:</strong> ${offer.position}<br/>
      <strong>Start Date:</strong> ${new Date(offer.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Complete all required training modules: <a href="https://conveniencehubofmaryland.com/staff/training-modules">Training Modules</a></li>
        <li>Complete IRS Form W-9 after you finish all required training (we will email you the link)</li>
        <li>Claim your first shift: <a href="https://conveniencehubofmaryland.com/staff/available-shifts">Available Shifts</a></li>
      </ul>
      <p>We are excited to have you on the team!</p>
      <p>Convenience Hub of Maryland<br/>202-579-2944</p>
    `

    // Attach the signed offer letter (same document the admin sees after signing).
    const signedLetter = buildOfferLetterHtml({
      documentId: offer.id,
      fullName: applicant.full_name,
      email: applicant.email,
      position: offer.position,
      startDate: offer.start_date,
      signedAt: now,
      signatureName: String(signature_name).trim(),
      signatureImage: offer.signature_image ?? imageText,
      managerName: offer.manager_name,
    })

    // The offer is already signed at this point, so an email failure must not show the applicant an error.
    try {
      await sendUserEmailWithAttachment(
        applicant.email,
        'Offer Accepted – Welcome to CHM!',
        confirmationHtml,
        { filename: 'Signed-Offer-Letter.html', content: signedLetter }
      )
    } catch (emailErr) {
      console.error('[accept] Applicant confirmation email failed:', emailErr)
    }

    // Send notification to admin
    try {
      await sendAdminEmail(
        `Offer Accepted: ${applicant.full_name}`,
        `${applicant.full_name} has accepted their offer for ${offer.position}. Ready to onboard!`
      )
    } catch (adminErr) {
      console.error('[accept] Admin notification failed:', adminErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[accept] Exception:', err)
    return NextResponse.json({ error: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 500 })
  }
}
