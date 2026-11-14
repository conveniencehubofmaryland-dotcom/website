import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'
import { NextRequest, NextResponse } from 'next/server'

const STATUSES = ['pending', 'cleared', 'not_cleared']

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { applicant_id, status } = await req.json()
    if (!applicant_id || !STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid applicant or status' }, { status: 400 })
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${encodeURIComponent(String(applicant_id))}`,
      {
        method: 'PATCH',
        headers: { ...serviceHeaders(), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ background_check_status: status }),
      }
    )
    if (!res.ok) {
      console.error('[background-check status] Update failed:', await res.text())
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[background-check status] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
