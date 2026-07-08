import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbPatchAuth } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { status } = body

  const validStatuses = ['new', 'contacted', 'booked', 'closed']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { error } = await dbPatchAuth('quote_requests', id, { status }, token)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
