import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { deleteApplicantCompletely } from '@/lib/applicant-cleanup'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const denied = await requireAdmin(req)
  if (denied) return denied

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    // Removes the applicant and everything linked to them, including stored files.
    const result = await deleteApplicantCompletely(id)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[staff delete] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
