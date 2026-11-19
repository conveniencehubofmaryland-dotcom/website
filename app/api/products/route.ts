import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Public list: only products marked available. "Coming Soon" items are never returned.
export async function GET() {
  try {
    const res = await fetch(
      // Cost and markup are never sent to the public site.
      `${SUPABASE_URL}/rest/v1/products?active=eq.true&select=id,sku,title,category,description,price,image_url,image_urls,weight_lb,sort_order&order=sort_order.asc`,
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
    const products = await res.json()
    return NextResponse.json(products, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
