import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?order=sort_order.asc`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        } as HeadersInit,
      }
    )

    if (!res.ok) throw new Error('Failed to fetch products')
    const products = await res.json()
    return NextResponse.json(products)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
