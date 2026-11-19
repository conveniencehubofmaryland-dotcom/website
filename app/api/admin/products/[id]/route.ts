import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbPatchAuth, dbDeleteAuth } from '@/lib/db'
import type { Product } from '@/lib/types'
import { productFields } from '@/lib/product-fields'

async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const rows = await dbSelectAuth<Product>('products', t, { id: `eq.${id}` })
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json().catch(() => null)
  const parsed = productFields(body, { isNew: false })
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  // A product can only go live with a price. Check the price it will end up with.
  const row = parsed.row
  if (row.status === 'available' && row.price === undefined) {
    const current = await dbSelectAuth<Product>('products', t, { id: `eq.${id}` })
    if (!current[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (current[0].price == null) {
      return NextResponse.json({ error: 'Enter the cost to set the price before making this product available.' }, { status: 400 })
    }
  }

  const { error } = await dbPatchAuth('products', id, row, t)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { error } = await dbDeleteAuth('products', id, t)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
