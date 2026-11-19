import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getOrder, ORDER_STATUSES, setOrderStatus, type OrderStatus } from '@/lib/orders'
import { sbFetch } from '@/lib/shift-eligibility'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Admin: change an order's status. Cancelling puts the items back in stock.
// Refunds are not automatic: refund the card in Clover yourself when you cancel a paid order.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { id } = await params
  if (!UUID.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const body = await req.json().catch(() => null)
  const status = body?.status as OrderStatus
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Status must be paid, ready, completed or cancelled.' }, { status: 400 })
  }

  const order = await getOrder(id)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.status === status) return NextResponse.json({ success: true })
  if (order.status === 'cancelled') {
    return NextResponse.json({ error: 'A cancelled order cannot be reopened. Place a new order instead.' }, { status: 400 })
  }

  if (status === 'cancelled') {
    for (const item of order.items) {
      await sbFetch('rpc/release_stock', { method: 'POST', body: JSON.stringify({ p_id: item.id, p_qty: item.qty }) })
        .catch(e => console.error('[orders] could not return stock:', item.id, e))
    }
  }

  const ok = await setOrderStatus(id, status)
  if (!ok) return NextResponse.json({ error: 'Could not update the order.' }, { status: 500 })
  return NextResponse.json({ success: true })
}
