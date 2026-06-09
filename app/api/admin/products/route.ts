import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'
import type { Product } from '@/lib/types'

async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const products = await dbSelectAuth<Product>('products', t, { order: 'sort_order' })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { sku, title, category, description, price, image_url, active, sort_order } = body

  if (!sku?.trim() || !title?.trim() || !category?.trim()) {
    return NextResponse.json({ error: 'SKU, title, and category are required' }, { status: 400 })
  }

  const { error } = await dbInsertAuth('products', {
    sku: sku.trim(),
    title: title.trim(),
    category: category.trim(),
    description: description?.trim() || null,
    price: price || null,
    image_url: image_url?.trim() || null,
    active: !!active,
    sort_order: sort_order ?? 0,
  }, t)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
