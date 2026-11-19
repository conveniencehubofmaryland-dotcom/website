import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { brandEmail, CHM_REPLY_TO } from '@/lib/email-brand'
import { sbFetch } from '@/lib/shift-eligibility'

const ADMIN_EMAIL = 'conveniencehubofmaryland@gmail.com'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_ITEMS = 20
const MAX_QTY = 20

type Line = { id: string; title: string; sku: string; price: number; qty: number }

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

// Takes a product payment. Prices are read from the products table here, never from the browser.
// Only products marked available can be bought. Requires CLOVER_PRIVATE_KEY and CLOVER_API_BASE.
export async function POST(request: NextRequest) {
  const privateKey = process.env.CLOVER_PRIVATE_KEY
  const apiBase = process.env.CLOVER_API_BASE
  if (!privateKey || !apiBase) {
    return NextResponse.json({ error: 'Online payment is not available right now. Please call 202-579-2944.' }, { status: 500 })
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
  if (!token.startsWith('clv_')) {
    return NextResponse.json({ error: 'Invalid payment details. Please try again.' }, { status: 400 })
  }
  if (!name || !email.includes('@') || !phone) {
    return NextResponse.json({ error: 'Please enter your name, email and phone number.' }, { status: 400 })
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

  // Look up current prices. Only available products count.
  const ids = Array.from(wanted.keys()).join(',')
  let found: { id: string; title: string; sku: string; price: number | string | null }[]
  try {
    const res = await sbFetch(`products?id=in.(${ids})&active=eq.true&select=id,title,sku,price`)
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
    lines.push({ id, title: p.title, sku: p.sku, price, qty })
  }

  const total = Math.round(lines.reduce((sum, l) => sum + l.price * l.qty, 0) * 100) / 100
  if (total < 1) {
    return NextResponse.json({ error: 'This order needs a personal review. Please call 202-579-2944.' }, { status: 400 })
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
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({
      name,
      email,
      phone,
      items: lines.map(l => ({ id: l.id, sku: l.sku, title: l.title, price: l.price, qty: l.qty })),
      total,
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
    const table = `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%">${rows}
<tr><td style="padding:8px 0;font-weight:700;border-top:2px solid #eee">Total paid</td><td style="padding:8px 0;font-weight:700;text-align:right;border-top:2px solid #eee;color:#E8192C">$${total.toFixed(2)}</td></tr></table>`

    await send({
      reply_to: [CHM_REPLY_TO],
      from: 'CHM Orders <support@conveniencehubofmaryland.com>',
      to: [ADMIN_EMAIL],
      subject: `Product order: $${total.toFixed(2)} from ${esc(name)}`,
      html: brandEmail(`<h2 style="color:#E8192C">New Product Order</h2>
<p style="font-size:14px">${esc(name)} · ${esc(email)} · ${esc(phone)}</p>
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
<p style="font-size:12px;color:#666;margin-top:12px">Reference: ${chargeId}</p>
<p style="font-size:13px;color:#666;margin-top:16px">Questions? Call or text 202-579-2944.</p>`),
    })
  }

  return NextResponse.json({ ok: true, chargeId, amount: total })
}
