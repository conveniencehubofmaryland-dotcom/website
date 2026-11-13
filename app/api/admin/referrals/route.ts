import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { MemberReferral } from '@/lib/types'

export async function GET() {
  const token = (await cookies()).get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await dbSelectAuth<MemberReferral>('member_referrals', token, { order: 'created_at.desc' })
  return NextResponse.json(rows)
}

