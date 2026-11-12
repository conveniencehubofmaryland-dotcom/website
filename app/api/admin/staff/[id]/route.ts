import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'

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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          ...serviceHeaders(),
        },
      }
    )

    if (!res.ok) {
      const errorBody = await res.text()
      console.error('[staff delete] Supabase error:', errorBody)
      return NextResponse.json({ error: 'Failed to delete staff record' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[staff delete] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
