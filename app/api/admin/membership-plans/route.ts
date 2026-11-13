import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'
import type { MembershipPlan } from '@/lib/types'

async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await dbSelectAuth<MembershipPlan>('membership_plans', t, { order: 'sort_order' })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const { error } = await dbInsertAuth('membership_plans', {
    tier: body.tier === 'premium' ? 'premium' : 'standard',
    name: body.name.trim(),
    price_label: body.price_label?.trim() || null,
    subtitle: body.subtitle?.trim() || null,
    features: Array.isArray(body.features) ? body.features : [],
    sort_order: Number(body.sort_order) || 0,
    active: true,
  }, t)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
