import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const applicantId = req.nextUrl.searchParams.get('applicant_id')

  if (!applicantId) {
    return NextResponse.json({ error: 'Missing applicant_id' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicantId}&select=orientation_accepted`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    const data = await res.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ orientation_accepted: false })
    }

    return NextResponse.json({ orientation_accepted: data[0].orientation_accepted })
  } catch (err) {
    console.error('[welcome-check] Error:', err)
    return NextResponse.json({ orientation_accepted: false })
  }
}
