import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { brandEmail, CHM_REPLY_TO } from '@/lib/email-brand'
import { sbFetch } from '@/lib/shift-eligibility'
import { quoteOrder, type Fulfillment } from '@/lib/shop-pricing'

const ADMIN_EMAIL = 'conveniencehubofmaryland@gmail.com'
const SHOP_PHONE = '202-579-2944'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_ITEMS = 20
const MAX_QTY = 20

type Line = { id: string; title: string; sku: string; price: number; qty: number; weight_lb: number | null }
type Address = { line1: string; line2: string; city: string; state: string; zip: string }

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

function readAddress(v: unknown): Address | { error: string } {
  const a = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>
  const s = (k: string) => (typeof a[k] === 'string' ? (a[k] as string).trim() : '')
  const addr = { line1: s('line1'), line2: s('line2'), city: s('city'), state: s('state').toUpperCase(), zip: s('zip') }
  if (addr.line1.length < 3 || !addr.city || !/^[A-Z]{2}$/.test(addr.state) || !/^\d{5}(-\d{4})?$/.test(addr.zip)) {
    return { error: 'Please enter a full shipping address (street, city, 2-letter state and ZIP code).' }
  }
  return addr
}

// Takes a product payment. Prices and shipping are calculated here from the products table, never from the browser.
// Only products marked available can be bought. Requires CLOVER_PRIVATE_KEY and CLOVER_API_BASE.
export async function POST(request: NextRequest) {
  const privateKey = process.env.CLOVER_PRIVATE_KEY
  const apiBase = process.env.CLOVER_API_BASE
  if (!privateKey || !apiBase) {
    return NextResponse.json({ error: `Online payment is not available right now. Please call ${SHOP_PHONE}.` }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const fulfillment: Fulfillment | null = body.fulfillment === 'ship' ? 'ship' : body.fulfillment === 'pickup' ? 'pickup' : null
  if (!token.startsWith('clv_')) {
    return NextResponse.json({ error: 'Invalid payment details. Please try again.' }, { status: 400 })
  }
  if (!name || !email.includes('@') || phone.length < 7) {
    return NextResponse.json({ error: 'Please enter your name, email and phone number.' }, { status: 400 })
  }
  if (!fulfillment) {
    return NextResponse.json({ error: 'Please choose pickup or shipping.' }, { status: 400 })
  }
  let shipTo: Address | null = null
  if (fulfillment === 'ship') {
    const addr = readAddress(body.shipTo)
    if ('error' in addr) return NextResponse.json({ error: addr.error }, { status: 400 })
    shipTo = addr
  }

  // Merge duplicate products and check quantities.
  const wanted = new Map<string, number>()
  const rawItems = Array.isArray(body.items) ? body.items : []
  for (const it of rawItems as { id?: unknown; qty?: unknown }[]) {
    const id = typeof it.id === 'string' ? it.id : ''
    const qty = Number(it.qty)
    if (!UUID.test(id) || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return NextResponse.json({ error: 'Your cart has an invalid item. Please refresh and try again.' }, { status: 400 })
    }
    wanted.set(id, Math.min(MAX_QTY, (wanted.get(id) ?? 0) + qty))
  }
  if (wanted.size === 0 || wanted.size > MAX_ITEMS) {
    return NextResponse.json({ error: 'Your cart is empty or too large. Please review it and try again.' }, { status: 400 })
  }

  // Look up current prices and weights. Only available products count.
  const ids = Array.from(wanted.keys()).join(',')
  let found: { id: string; title: string; sku: string; price: number | string | null; weight_lb: number | string | null }[]
  try {
    const res = await sbFetch(`products?id=in.(${ids})&active=eq.true&select=id,title,sku,price,weight_lb`)
    if (!res.ok) throw new Error(`lookup ${res.status}`)
    found = (await res.json()) as typeof found
  } catch (e) {
    console.error('[product-charge] price lookup failed:', e)
    return NextResponse.json({ error: 'Could not check prices. Please try again.' }, { status: 502 })
  }
  const lines: Line[] = []
  for (const [id, qty] of wanted) {
    const p = found.find(f => f.id === id)
    const price = p?.price == null ? NaN : Number(p.price)
    if (!p || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Some items in your cart are no longer available. Please review your cart.' }, { status: 400 })
    }
    const weight = p.weight_lb == null ? null : Number(p.weight_lb)
    lines.push({ id, title: p.title, sku: p.sku, price, qty, weight_lb: weight })
  }

  const quote = quoteOrder(lines, fulfillment)
  if (!quote.canShip) {
    return NextResponse.json(
      { error: `This order cannot be shipped online. Please choose pickup or call ${SHOP_PHONE}.` },
      { status: 400 }
    )
  }
  const total = quote.total
  if (total < 1) {
    return NextResponse.json({ error: `This order needs a personal review. Please call ${SHOP_PHONE}.` }, { status: 400 })
  }
  const cents = Math.round(total * 100)

  let charge: { id?: string; status?: string } | null = null
  let raw = ''
  try {
    const cres = await fetch(`${apiBase.replace(/\/$/, '')}/v1/charges`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${privateKey}`,
        'idempotency-key': crypto.randomUUID(),
      },
      body: JSON.stringify({ amount: cents, currency: 'usd', source: token }),
      signal: AbortSignal.timeout(20000),
    })
    raw = await cres.text()
    try {
      charge = JSON.parse(raw)
    } catch {
      charge = null
    }
    if (!cres.ok || !charge?.id || charge.status === 'failed' || charge.status === 'declined') {
      console.error('[product-charge] charge failed:', cres.status, raw.slice(0, 500))
      return NextResponse.json(
        { error: `Payment was not completed. Clover replied ${cres.status}: ${raw.slice(0, 300)}` },
        { status: 402 }
      )
    }
  } catch (e) {
    const reason = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
    console.error('[product-charge] charge error:', reason)
    return NextResponse.json({ error: `Payment could not be processed. Reason: ${reason.slice(0, 300)}` }, { status: 502 })
  }

  const chargeId = charge.id as string

  // Record the order. The payment has already been taken, so a save failure is logged with the charge ID.
  const saved = await sbFetch('product_orders', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      name,
      email,
      phone,
      items: lines.map(l => ({ id: l.id, sku: l.sku, title: l.title, price: l.price, qty: l.qty, weight_lb: l.weight_lb })),
      total,
      fulfillment,
      shipping_fee: quote.shipping,
      ship_to: shipTo,
      clover_charge_id: chargeId,
      status: 'paid',
    }),
  }).catch(e => {
    console.error('[product-charge] order save error:', e)
    return null
  })
  if (saved && !saved.ok) {
    console.error('[product-charge] order save failed for charge', chargeId, await saved.text())
  }

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const send = (payload: Record<string, unknown>) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(e => console.error('[product-charge] email error:', e))

    const rows = lines
      .map(l => `<tr><td style="padding:6px 0">${esc(l.title)} × ${l.qty}</td><td style="padding:6px 0;text-align:right">$${(l.price * l.qty).toFixed(2)}</td></tr>`)
      .join('')
    const shipRow = quote.shipping > 0
      ? `<tr><td style="padding:6px 0">Shipping</td><td style="padding:6px 0;text-align:right">$${quote.shipping.toFixed(2)}</td></tr>`
      : ''
    const table = `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%">${rows}${shipRow}
<tr><td style="padding:8px 0;font-weight:700;border-top:2px solid #eee">Total paid</td><td style="padding:8px 0;font-weight:700;text-align:right;border-top:2px solid #eee;color:#E8192C">$${total.toFixed(2)}</td></tr></table>`
    const how = shipTo
      ? `<p style="font-size:14px"><strong>Ship to:</strong><br>${esc(shipTo.line1)}${shipTo.line2 ? '<br>' + esc(shipTo.line2) : ''}<br>${esc(shipTo.city)}, ${esc(shipTo.state)} ${esc(shipTo.zip)}</p>`
      : `<p style="font-size:14px"><strong>Pickup:</strong> call or text ${SHOP_PHONE} to arrange a pickup time.</p>`

    await send({
      reply_to: [CHM_REPLY_TO],
      from: 'CHM Orders <support@conveniencehubofmaryland.com>',
      to: [ADMIN_EMAIL],
      subject: `Product order (${fulfillment}): $${total.toFixed(2)} from ${esc(name)}`,
      html: brandEmail(`<h2 style="color:#E8192C">New Product Order</h2>
<p style="font-size:14px">${esc(name)} · ${esc(email)} · ${esc(phone)}</p>
${how}
${table}
<p style="font-size:12px;color:#666;margin-top:12px">Clover charge ID: ${chargeId}</p>`),
    })

    await send({
      reply_to: [CHM_REPLY_TO],
      from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
      to: [email],
      subject: 'Your order from Convenience Hub of Maryland',
      html: brandEmail(`<h2 style="color:#E8192C">Thank you, ${esc(name.split(' ')[0])}!</h2>
<p style="font-size:14px">Here is your order receipt:</p>
${table}
${how}
<p style="font-size:12px;color:#666;margin-top:12px">Reference: ${chargeId}</p>
<p style="font-size:13px;color:#666;margin-top:16px">Questions? Call or text ${SHOP_PHONE}.</p>`),
    })
  }

  return NextResponse.json({ ok: true, chargeId, amount: total, shipping: quote.shipping })
}
