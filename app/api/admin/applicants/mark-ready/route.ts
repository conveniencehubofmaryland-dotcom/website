import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

    const now = new Date().toISOString()

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboarding_status: 'ready_to_claim_shifts',
          updated_at: now,
        }),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      console.error('[mark-ready] Error:', error)
      return NextResponse.json({ error: 'Failed to update applicant' }, { status: 500 })
    }

    console.log('[mark-ready] Applicant marked ready:', applicant_id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[mark-ready] Exception:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
