export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters?sign_token=eq.${token}&select=id,applicant_id,position,salary_annual,start_date,benefits_summary,offer_letter_applicants(full_name,email)`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await res.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Offer not found or already signed' }, { status: 404 })
    }

    const offer = data[0]
    const applicant = offer.offer_letter_applicants

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
