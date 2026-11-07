import { NextRequest, NextResponse } from 'next/server'
import { computeQuote, type Selections } from '@/lib/quote-pricing'

const SITE = 'https://conveniencehubofmaryland.com'
const DEPOSIT_RATE = 0.3

// Creates a Clover hosted checkout. The amount is calculated here from the quote details,
// never taken from the browser.
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

  let body: { kind?: unknown; category?: unknown; selections?: unknown; name?: unknown; email?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const kind = body.kind === 'deposit' ? 'deposit' : body.kind === 'full' ? 'full' : null
  const category = typeof body.category === 'string' ? body.category : ''
  const selections = (body.selections && typeof body.selections === 'object' ? body.selections : {}) as Selections
  if (!kind || !category) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const quote = computeQuote(category, selections)
  if (quote.total === null || quote.total < 1) {
    return NextResponse.json(
      { error: 'This quote needs a personal review. Please call 202-579-2944 to pay.' },
      { status: 400 }
    )
  }

  const total = Math.round(quote.total * 100) / 100
  const amount = kind === 'deposit' ? Math.round(total * DEPOSIT_RATE * 100) / 100 : total
  const cents = Math.round(amount * 100)
  const label = kind === 'deposit' ? 'Booking deposit' : 'Booking payment in full'

  // Clover needs at least a first/last name or an email for the checkout.
  const fullName = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const nameParts = fullName.split(/\s+/).filter(Boolean)
  const customer: Record<string, string> = {}
  if (nameParts[0]) customer.firstName = nameParts[0]
  if (nameParts.length > 1) customer.lastName = nameParts.slice(1).join(' ')
  if (email) customer.email = email

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
        customer,
        shoppingCart: {
          lineItems: [{ name: label, price: cents, unitQty: 1, note: 'Convenience Hub of Maryland' }],
        },
        redirectUrls: {
          success: `${SITE}/`,
          failure: `${SITE}/book`,
        },
      }),
    })
    const raw = await res.text()
    let data: { href?: string } | null = null
    try {
      data = JSON.parse(raw)
    } catch {
      data = null
    }
    if (!res.ok || !data?.href) {
      console.error('[clover] checkout failed:', res.status, raw.slice(0, 500))
      return NextResponse.json(
        { error: `Could not start payment. Clover replied ${res.status}: ${raw.slice(0, 300)}` },
        { status: 502 }
      )
    }
    return NextResponse.json({ url: data.href, amount })
  } catch (e) {
    console.error('[clover] error:', e)
    return NextResponse.json(
      { error: 'Could not start payment. Please call 202-579-2944.' },
      { status: 502 }
    )
  }
}
