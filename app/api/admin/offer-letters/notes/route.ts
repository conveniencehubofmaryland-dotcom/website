import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { applicant_id, notes } = body

  if (!applicant_id) {
    return NextResponse.json({ error: 'Missing applicant_id' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: notes || null, updated_at: new Date().toISOString() }),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      console.error('[notes] Supabase error:', error)
      return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[notes] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
