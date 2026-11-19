import { NextResponse } from 'next/server'
import { PUBLIC_PRODUCT_SELECT, toPublic, type ProductDbRow } from '@/lib/public-products'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Public list: only products marked Available with stock left. Cost, markup and stock counts are never sent.
export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?active=eq.true&select=${PUBLIC_PRODUCT_SELECT}&order=sort_order.asc`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        } as HeadersInit,
        cache: 'no-store',
      }
    )

    if (!res.ok) throw new Error('Failed to fetch products')
    const rows = (await res.json()) as ProductDbRow[]
    return NextResponse.json(toPublic(rows), { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
