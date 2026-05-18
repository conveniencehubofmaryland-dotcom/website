import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'
import type { Service } from '@/lib/types'


function token(req?: NextRequest): Promise<string> {
  void req
  return cookies().then(c => c.get('chm_admin')?.value ?? '')
}

export async function GET() {
  const t = await token()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const services = await dbSelectAuth<Service>('services', t, { order: 'sort_order' })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const t = await token()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, title, subtitle, description, price_from, pricing_details, sort_order } = body

  if (!id?.trim() || !title?.trim()) {
    return NextResponse.json({ error: 'ID and title are required' }, { status: 400 })
  }

  const { error } = await dbInsertAuth('services', {
    id:              id.trim(),
    slug:            id.trim(),
    title:           title.trim(),
    subtitle:        subtitle?.trim() || null,
    description:     description?.trim() || null,
    price_from:      price_from?.trim() || null,
    pricing_details: pricing_details ?? [],
    sort_order:      sort_order ?? 0,
    active:          true,
  }, t)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
