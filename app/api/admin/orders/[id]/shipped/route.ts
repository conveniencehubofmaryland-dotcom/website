import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getOrder } from '@/lib/orders'
import { sbFetch } from '@/lib/shift-eligibility'
import { brandEmail, CHM_REPLY_TO } from '@/lib/email-brand'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))

// Admin: mark a shipped order as ready with its tracking number, and email the tracking number to the customer.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json().catch(() => null)
  const tracking = typeof body?.tracking === 'string' ? body.tracking.trim() : ''
  if (!tracking || tracking.length > 60) {
    return NextResponse.json({ error: 'Enter the tracking number (up to 60 characters).' }, { status: 400 })
  }

  const order = await getOrder(id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.fulfillment !== 'ship') {
    return NextResponse.json({ error: 'This order is for pickup, so there is nothing to ship.' }, { status: 400 })
  }
  if (order.status === 'cancelled') {
    return NextResponse.json({ error: 'This order was cancelled.' }, { status: 400 })
  }

  const res = await sbFetch(`product_orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ tracking_number: tracking, status: 'ready' }),
  })
  if (!res.ok) return NextResponse.json({ error: 'Could not save the tracking number.' }, { status: 500 })

  let emailed = false
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && order.email) {
    const address = order.ship_to
      ? `${esc(order.ship_to.line1)}${order.ship_to.line2 ? '<br>' + esc(order.ship_to.line2) : ''}<br>${esc(order.ship_to.city)}, ${esc(order.ship_to.state)} ${esc(order.ship_to.zip)}`
      : ''
    try {
      const sent = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply_to: [CHM_REPLY_TO],
          from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
          to: [order.email],
          subject: 'Your order has shipped',
          html: brandEmail(`<h2 style="color:#E8192C">Your order is on its way, ${esc(order.name.split(' ')[0])}!</h2>
<p style="font-size:14px">Tracking number: <strong>${esc(tracking)}</strong></p>
${address ? `<p style="font-size:14px"><strong>Shipping to:</strong><br>${address}</p>` : ''}
<p style="font-size:14px">Reply to this email if you have any questions.</p>
<p style="font-size:12px;color:#666;margin-top:12px">Reference: ${esc(order.clover_charge_id ?? order.id)}</p>`),
        }),
      })
      emailed = sent.ok
      if (!sent.ok) console.error('[orders] shipped email failed:', sent.status)
    } catch (e) {
      console.error('[orders] shipped email error:', e)
    }
  }

  return NextResponse.json({ success: true, emailed })
}
