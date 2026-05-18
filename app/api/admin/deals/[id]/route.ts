import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbPatchAuth, dbDeleteAuth } from '@/lib/db'


async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { error } = await dbPatchAuth('deals', id, body, t)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await dbDeleteAuth('deals', id, t)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
