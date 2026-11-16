import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/admin-auth'
import { markApplicantReady } from '@/lib/ready-to-claim'

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
    const denied = await requireAdmin(req)
    if (denied) return denied

    const result = await markApplicantReady(String(applicant_id))
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    console.log('[mark-ready] Applicant marked ready and email sent:', applicant_id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[mark-ready] Exception:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
