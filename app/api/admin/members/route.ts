import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbPatchAuth, dbDeleteAuth, dbInsertAuth } from '@/lib/db'
import type { Member } from '@/lib/types'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const members = await dbSelectAuth<Member>('members', token, { select: '*', order: 'created_at.desc' })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { name, phone, email, state, address, preferred_services, service_frequency, recurring } = body
  if (!name?.trim() || !phone?.trim() || !email?.trim() || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const { error } = await dbInsertAuth('members', {
    name: name.trim(), phone: phone.trim(), email: email.trim(), state,
    address: address?.trim() || null,
    preferred_services: Array.isArray(preferred_services) && preferred_services.length ? preferred_services : null,
    service_frequency: service_frequency || null,
    recurring: !!recurring,
    active: true,
  }, token)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...patch } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await dbPatchAuth('members', id, patch, token)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await dbDeleteAuth('members', id, token)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
