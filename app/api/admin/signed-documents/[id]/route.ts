import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { id } = await params

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${id}`,
      {
        headers: {
          ...serviceHeaders(),
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const data = await res.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (err) {
    console.error('[api] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
