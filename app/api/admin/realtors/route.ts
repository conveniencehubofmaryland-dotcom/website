import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbPatchAuth } from '@/lib/db'

async function getToken() {
  return (await cookies()).get('chm_admin')?.value ?? ''
}

export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const realtors = await dbSelectAuth<Record<string, unknown>>('realtors', token, {
    select: 'id,name,email,phone,brokerage,approved,created_at', order: 'created_at.desc',
  })
  const codes = await dbSelectAuth<Record<string, unknown>>('referral_codes', token, {
    select: '*,realtors(name)', order: 'created_at.desc',
  })
  return NextResponse.json({ realtors, codes })
}

// { type: 'realtor', id, approved } or { type: 'code', id, status: 'revoked' }
export async function PATCH(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const table = body.type === 'code' ? 'referral_codes' : 'realtors'
  const patch = body.type === 'code' ? { status: 'revoked' } : { approved: !!body.approved }
  const { error } = await dbPatchAuth(table, body.id, patch, token)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ ok: true })
}
