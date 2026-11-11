import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbPatchAuth } from '@/lib/db'

// Refunds a paid booking in full through Clover, then marks the booking cancelled.
export async function POST(req: NextRequest) {
  const token = (await cookies()).get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const id = typeof body.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'Missing booking id.' }, { status: 400 })

  const rows = await dbSelectAuth<{
    id: string; paid: boolean | null; amount_paid: number | null; payment_charge_id: string | null
    refund_id: string | null; notes: string | null
  }>('appointments', token, {
    id: `eq.${id}`,
    select: 'id,paid,amount_paid,payment_charge_id,refund_id,notes',
    limit: '1',
  })
  const appt = rows[0]
  if (!appt) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
  if (!appt.paid || !appt.amount_paid) return NextResponse.json({ error: 'This booking has no card payment to refund.' }, { status: 400 })
  if (appt.refund_id) return NextResponse.json({ error: 'This booking was already refunded.' }, { status: 400 })

  // Newer bookings store the charge ID in its own column; older ones have it in the notes.
  const fromNotes = (appt.notes || '').match(/Clover charge ([A-Za-z0-9_-]+)/)?.[1] || ''
  const chargeId = appt.payment_charge_id || fromNotes
  const privateKey = process.env.CLOVER_PRIVATE_KEY
  const apiBase = process.env.CLOVER_API_BASE
  if (!chargeId) return NextResponse.json({ error: 'No Clover charge ID found for this booking.' }, { status: 400 })
  if (!privateKey || !apiBase) return NextResponse.json({ error: 'Clover is not configured on the server.' }, { status: 500 })

  const cents = Math.round(Number(appt.amount_paid) * 100)
  let refund: { id?: string; status?: string; message?: string } = {}
  let raw = ''
  try {
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/v1/refunds`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${privateKey}`,
        'user-agent': 'CHM-Website/1.0',
        'idempotency-key': crypto.randomUUID(),
      },
      body: JSON.stringify({ charge: chargeId, amount: cents, reason: 'requested_by_customer' }),
      signal: AbortSignal.timeout(20000),
    })
    raw = await res.text()
    try { refund = JSON.parse(raw) } catch { refund = {} }
    if (!res.ok || !refund.id) {
      console.error('[refund] Clover refused:', res.status, raw.slice(0, 500))
      return NextResponse.json({ error: `Clover did not refund the payment (${res.status}). ${raw.slice(0, 200)}` }, { status: 502 })
    }
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    console.error('[refund] error:', reason)
    return NextResponse.json({ error: `Could not reach Clover. ${reason}` }, { status: 502 })
  }

  const { error } = await dbPatchAuth('appointments', id, {
    refund_id: refund.id,
    refunded_at: new Date().toISOString(),
    refunded_amount: Number(appt.amount_paid),
    payment_charge_id: chargeId,
    status: 'cancelled',
  }, token)
  if (error) {
    console.error('[refund] refunded at Clover but booking not updated:', error)
    return NextResponse.json({ error: `Refunded at Clover (refund ${refund.id}), but the booking could not be updated. Please note it manually.` }, { status: 500 })
  }
  return NextResponse.json({ ok: true, refund_id: refund.id })
}
