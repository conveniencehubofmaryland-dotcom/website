import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'
import type { BundleRow } from '@/lib/types'

async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await dbSelectAuth<BundleRow>('bundles', t, { order: 'sort_order' })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const { error } = await dbInsertAuth('bundles', {
    category: body.category ?? 'residential',
    name: body.name.trim(),
    price: Number(body.price) || 0,
    savings_percent: Number(body.savings_percent) || 0,
    description: body.description?.trim() || null,
    highlighted: !!body.highlighted,
    services: Array.isArray(body.services) ? body.services : [],
    sort_order: Number(body.sort_order) || 0,
    active: true,
  }, t)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
