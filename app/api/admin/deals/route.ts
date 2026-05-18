import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'
import type { Deal } from '@/lib/types'


async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const deals = await dbSelectAuth<Deal>('deals', t, { order: 'sort_order' })
  return NextResponse.json(deals)
}

export async function POST(req: NextRequest) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { badge, headline, detail, sort_order } = body

  if (!badge?.trim() || !headline?.trim()) {
    return NextResponse.json({ error: 'Badge and headline are required' }, { status: 400 })
  }

  const { error } = await dbInsertAuth('deals', {
    badge:      badge.trim(),
    headline:   headline.trim(),
    detail:     detail?.trim() || null,
    sort_order: sort_order ?? 0,
    active:     true,
  }, t)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
