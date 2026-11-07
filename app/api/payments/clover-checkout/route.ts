import { NextRequest, NextResponse } from 'next/server'

const SITE = 'https://conveniencehubofmaryland.com'

// Creates a Clover hosted checkout for an exact amount and returns its payment page address.
// Requires these hosting settings: CLOVER_MERCHANT_ID, CLOVER_PRIVATE_KEY, CLOVER_API_BASE.
export async function POST(request: NextRequest) {
  const merchantId = process.env.CLOVER_MERCHANT_ID
  const privateKey = process.env.CLOVER_PRIVATE_KEY
  const apiBase = process.env.CLOVER_API_BASE

  if (!merchantId || !privateKey || !apiBase) {
    return NextResponse.json(
      { error: 'Online payment is not available right now. Please call 202-579-2944.' },
      { status: 500 }
    )
  }

  let body: { amount?: unknown; label?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount < 1 || amount > 20000) {
    return NextResponse.json({ error: 'Invalid payment amount.' }, { status: 400 })
  }
  const cents = Math.round(amount * 100)
  const label =
    typeof body.label === 'string' && body.label.trim()
      ? body.label.trim().slice(0, 100)
      : 'Convenience Hub of Maryland service'

  try {
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/invoicingcheckoutservice/v1/checkouts`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-Clover-Merchant-Id': merchantId,
        authorization: `Bearer ${privateKey}`,
      },
      body: JSON.stringify({
        customer: {},
        shoppingCart: {
          lineItems: [{ name: label, price: cents, unitQty: 1, note: 'Convenience Hub of Maryland' }],
        },
        redirectUrls: {
          success: `${SITE}/`,
          failure: `${SITE}/book`,
        },
      }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.href) {
      console.error('[clover] checkout failed:', res.status, JSON.stringify(data))
      return NextResponse.json(
        { error: 'Could not start payment. Please call 202-579-2944.' },
        { status: 502 }
      )
    }
    return NextResponse.json({ url: data.href })
  } catch (e) {
    console.error('[clover] error:', e)
    return NextResponse.json(
      { error: 'Could not start payment. Please call 202-579-2944.' },
      { status: 502 }
    )
  }
}
