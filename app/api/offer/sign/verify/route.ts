import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  try {
    console.log('[verify] Token:', token)
    
    // First fetch the offer
    const offerRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters?sign_token=eq.${token}`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const offerText = await offerRes.text()
    console.log('[verify] Offer response status:', offerRes.status)
    console.log('[verify] Offer response:', offerText)

    if (!offerRes.ok) {
      return NextResponse.json({ error: `Offer fetch failed: ${offerText}` }, { status: 500 })
    }

    const offerData = JSON.parse(offerText)
    if (!offerData || offerData.length === 0) {
      console.log('[verify] No offer found for token')
      return NextResponse.json({ error: 'Offer not found or already signed' }, { status: 404 })
    }

    const offer = offerData[0]
    console.log('[verify] Offer found:', offer.id)

    // Then fetch the applicant
    const appRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${offer.applicant_id}`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const appText = await appRes.text()
    console.log('[verify] Applicant response status:', appRes.status)
    console.log('[verify] Applicant response:', appText)

    if (!appRes.ok) {
      return NextResponse.json({ error: `Applicant fetch failed: ${appText}` }, { status: 500 })
    }

    const appData = JSON.parse(appText)
    if (!appData || appData.length === 0) {
      console.log('[verify] No applicant found')
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    const applicant = appData[0]
    console.log('[verify] Applicant found:', applicant.id)

    return NextResponse.json({
      id: offer.id,
      applicant_id: offer.applicant_id,
      position: offer.position,
      salary_annual: offer.salary_annual,
      start_date: offer.start_date,
      benefits_summary: offer.benefits_summary,
      applicant_name: applicant.full_name,
      applicant_email: applicant.email,
    })
  } catch (err) {
    console.error('[verify] Error:', err)
    return NextResponse.json({ error: `Exception: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 500 })
  }
}
