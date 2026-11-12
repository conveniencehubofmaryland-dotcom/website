import { NextRequest, NextResponse } from 'next/server'
import { serviceHeaders } from '@/lib/supabase-keys'

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { applicant_id } = body

  if (!applicant_id) {
    return NextResponse.json({ error: 'Missing applicant_id' }, { status: 400 })
  }

  try {
    const now = new Date().toISOString()

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${encodeURIComponent(String(applicant_id))}`,
      {
        method: 'PATCH',
        headers: {
          ...serviceHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboarding_status: 'how_it_works_read',
          updated_at: now,
        }),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      console.error('[how-it-works] Supabase error:', error)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[how-it-works] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
