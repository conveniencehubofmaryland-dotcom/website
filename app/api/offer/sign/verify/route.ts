import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  try {
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

    const offerData = await offerRes.json()
    if (!offerData || offerData.length === 0) {
      return NextResponse.json({ error: 'Offer not found or already signed' }, { status: 404 })
    }

    const offer = offerData[0]

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

    const appData = await appRes.json()
    if (!appData || appData.length === 0) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    const applicant = appData[0]

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
    return NextResponse.json({ error: 'Failed to verify offer' }, { status: 500 })
  }
}
