import { NextRequest, NextResponse } from 'next/server'
import { computeQuote, type Selections } from '@/lib/quote-pricing'
import { isActiveMember } from '@/lib/membership'

const DEPOSIT_RATE = 0.3
const ADMIN_EMAIL = 'conveniencehubofmaryland@gmail.com'

// Charges a card token created in the browser by Clover's card fields.
// The amount is calculated here from the quote details, never taken from the browser.
// Requires hosting settings: CLOVER_PRIVATE_KEY, CLOVER_API_BASE.
export async function POST(request: NextRequest) {
  const privateKey = process.env.CLOVER_PRIVATE_KEY
  const apiBase = process.env.CLOVER_API_BASE
  if (!privateKey || !apiBase) {
    return NextResponse.json(
      { error: 'Online payment is not available right now. Please call 202-579-2944.' },
      { status: 500 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  const kind = body.kind === 'deposit' ? 'deposit' : body.kind === 'full' ? 'full' : null
  const category = typeof body.category === 'string' ? body.category : ''
  const selections = (body.selections && typeof body.selections === 'object' ? body.selections : {}) as Selections
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

  if (!token.startsWith('clv_') || !kind || !category) {
    return NextResponse.json({ error: 'Invalid payment details. Please try again.' }, { status: 400 })
  }

  const member = await isActiveMember(email)
  const quote = computeQuote(category, selections, { member })
  if (quote.total === null || quote.total < 1) {
    return NextResponse.json(
      { error: 'This quote needs a personal review. Please call 202-579-2944 to pay.' },
      { status: 400 }
    )
  }

  const total = Math.round(quote.total * 100) / 100
  const amount = kind === 'deposit' ? Math.round(total * DEPOSIT_RATE * 100) / 100 : total
  const cents = Math.round(amount * 100)

  let charge: { id?: string; status?: string; error?: unknown } | null = null
  let raw = ''
  try {
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/v1/charges`, {
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
    raw = await res.text()
    try {
      charge = JSON.parse(raw)
    } catch {
      charge = null
    }
    if (!res.ok || !charge?.id || charge.status === 'failed' || charge.status === 'declined') {
      console.error('[clover] charge failed:', res.status, raw.slice(0, 500))
      return NextResponse.json(
        { error: `Payment was not completed. Clover replied ${res.status}: ${raw.slice(0, 300)}` },
        { status: 402 }
      )
    }
  } catch (e) {
    const reason = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
    console.error('[clover] charge error:', reason)
    return NextResponse.json(
      { error: `Payment could not be processed. Reason: ${reason.slice(0, 300)}` },
      { status: 502 }
    )
  }

  const chargeId = charge.id as string
  const resendKey = process.env.RESEND_API_KEY
  const label = kind === 'deposit' ? 'Deposit' : 'Payment in full'

  if (resendKey) {
    const send = (payload: Record<string, unknown>) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(e => console.error('[clover] email error:', e))

    await send({
      from: 'CHM Payments <support@conveniencehubofmaryland.com>',
      to: [ADMIN_EMAIL],
      subject: `Payment received: $${amount.toFixed(2)} from ${name || 'client'}`,
      html: `<h2 style="color:#E8192C">Payment Received</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
<tr><td style="padding:6px 16px 6px 0;color:#666">Amount</td><td style="font-weight:600">$${amount.toFixed(2)} (${label})</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Client</td><td style="font-weight:600">${name || 'N/A'}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td>${email || 'N/A'}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td>${phone || 'N/A'}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Service</td><td>${category}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Clover charge ID</td><td>${chargeId}</td></tr>
</table>
<p style="margin-top:16px"><a href="https://conveniencehubofmaryland.com/admin/appointments" style="color:#E8192C;font-weight:600">Open admin to mark this booking paid</a></p>`,
    })

    if (email) {
      await send({
        from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
        reply_to: [ADMIN_EMAIL],
        to: [email],
        subject: 'Your payment receipt from Convenience Hub of Maryland',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<h2 style="color:#E8192C">Thank you${name ? `, ${name.split(' ')[0]}` : ''}!</h2>
<p>We received your payment of <strong>$${amount.toFixed(2)}</strong> (${label}).</p>
<p>Reference: ${chargeId}</p>
<p style="font-size:14px;color:#555">Questions? Call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a></p>
</div>`,
      })
    }
  }

  return NextResponse.json({ ok: true, chargeId, amount })
}
