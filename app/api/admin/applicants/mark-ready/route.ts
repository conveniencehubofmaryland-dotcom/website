import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbPatchAuth } from '@/lib/db'

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

    const { error } = await dbPatchAuth(
      'offer_letter_applicants',
      { onboarding_status: 'ready_to_claim_shifts', updated_at: now },
      token,
      { id: applicant_id }
    )

    if (error) {
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
