import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  console.log('[verify-token] Request received, token:', token ? 'present' : 'missing')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  try {
    console.log('[verify-token] Querying database...')
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?claim_shift_token=eq.${token}&select=id,full_name`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    const data = await res.json()
    console.log('[verify-token] Query result:', data.length ? 'found' : 'not found')

    if (!data || data.length === 0) {
      console.log('[verify-token] Token not found in database')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const applicant = data[0]
    console.log('[verify-token] Success:', applicant.id)
    return NextResponse.json({ applicant_id: applicant.id })
  } catch (err) {
    console.error('[verify-token] Exception:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
