import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth, dbDeleteAuth } from '@/lib/db'

type Shift = {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  role: string
  notes?: string
  status?: string
  staff_name?: string
  staff_email?: string
  staff_phone?: string
}

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shifts = await dbSelectAuth<Shift>('shifts', token, { order: 'date.asc' })
  return NextResponse.json(shifts)
}

export async function POST(req: NextRequest) {
  const token = await getToken()
  console.log('[admin/shifts] POST request received, admin token present:', Boolean(token))
  console.log('[admin/shifts] POST runtime service role key present:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { date, start_time, end_time, location, role, notes } = body
  if (!date || !start_time || !end_time || !location || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await dbInsertAuth('shifts', {
    date,
    start_time,
    end_time,
    location,
    role,
    notes: notes?.trim() || null,
    status: 'available',
  }, token)

  if (error) {
    console.error('[admin/shifts] dbInsertAuth error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const token = await getToken()
  console.log('[admin/shifts] DELETE request received, admin token present:', Boolean(token))
  console.log('[admin/shifts] DELETE runtime service role key present:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = body?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await dbDeleteAuth('shifts', id, token)
  if (error) {
    console.error('[admin/shifts] dbDeleteAuth error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
