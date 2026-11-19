import { requireAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { recordNoShow } from '@/lib/no-show'

// Admin marks a claimed shift as a no-show (the automatic check uses the same logic).
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { applicant_id, shift_id, notes } = await req.json()

    if (!applicant_id || !shift_id) {
      return NextResponse.json({ error: 'Missing applicant_id or shift_id' }, { status: 400 })
    }

    const result = await recordNoShow({
      applicantId: applicant_id,
      shiftId: shift_id,
      notes: typeof notes === 'string' ? notes : null,
      markedBy: 'admin',
    })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })

    return NextResponse.json({
      success: true,
      no_show_count: result.noShowCount,
      applicant_name: result.applicantName,
      warning: result.blocked
        ? `⚠️ ${result.noShowCount} no-shows - this staff member is blocked from claiming new shifts`
        : null,
    })
  } catch (err) {
    console.error('[mark-noshow] Error:', err)
    return NextResponse.json({ error: 'Failed to mark no-show' }, { status: 500 })
  }
}
