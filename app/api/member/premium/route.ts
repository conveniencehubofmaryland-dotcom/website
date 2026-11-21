import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSessionMember } from '@/lib/member-session'
import { sbFetch, todayInEastern } from '@/lib/shift-eligibility'
import { sendAdminEmail, sendUserEmailHtml } from '@/lib/email'
import { buildInvoiceHtml, createInvoice, invoiceSubject } from '@/lib/invoice'
import { createCloverCustomer, chargeCloverCustomer } from '@/lib/recurring'
import { PREMIUM_BILLING, PREMIUM_PRICE, type PremiumBilling } from '@/lib/membership-tiers'
import { nextPremiumDate, premiumPeriodLabel } from '@/lib/member-billing'

// Member signs up for Premium: saves the card, takes the first payment now, then renews automatically.
export async function POST(request: NextRequest) {
  const member = await getSessionMember()
  if (!member) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const token = typeof body.token === 'string' ? body.token : ''
  const billing = body.billing as PremiumBilling
  if (!token.startsWith('clv_') || !PREMIUM_BILLING.includes(billing)) {
    return NextResponse.json({ error: 'Invalid payment details. Please try again.' }, { status: 400 })
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: 'Please tick the box to agree to automatic billing.' }, { status: 400 })
  }
  if (member.tier === 'premium') {
    return NextResponse.json({ error: 'You are already a Premium member.' }, { status: 400 })
  }

  const amount = PREMIUM_PRICE[billing]

  // 1. Save the card with Clover.
  const customer = await createCloverCustomer({ email: member.email, name: member.name, token })
  if (!customer.ok) return NextResponse.json({ error: customer.error }, { status: 502 })

  // 2. Take the first payment now.
  const charge = await chargeCloverCustomer(customer.customerId, amount, `premium-start-${member.id}-${crypto.randomUUID()}`)
  if (!charge.ok) {
    return NextResponse.json({ error: `The first payment was not completed. ${charge.error}` }, { status: 402 })
  }

  // 3. Switch the member to Premium and record the renewal.
  const today = todayInEastern()
  const next = nextPremiumDate(today, billing)
  const save = await sbFetch(`members?id=eq.${member.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      tier: 'premium',
      premium_clover_customer_id: customer.customerId,
      premium_billing: billing,
      premium_next_charge_date: next,
      premium_started_at: new Date().toISOString(),
      premium_failed_attempts: 0,
      premium_last_error: null,
    }),
  })
  if (!save.ok) {
    console.error('[premium] member not saved; first charge', charge.chargeId, 'status', save.status)
    await sendAdminEmail(
      `URGENT: Premium not saved for ${member.name}`,
      `The first Premium payment of $${amount.toFixed(2)} was taken (reference ${charge.chargeId}), but the member could not be switched to Premium, so it will NOT renew automatically. Set the member's tier and renewal by hand, and contact the member.`
    ).catch(e => console.error('[premium] admin email error:', e))
    return NextResponse.json({ error: 'Your payment was taken, but we could not finish setting up Premium. Please call 202-579-2944.' }, { status: 500 })
  }

  // 4. Invoice for the payment, emailed to the member.
  try {
    const invoice = await createInvoice({
      chargeId: charge.chargeId,
      name: member.name,
      email: member.email,
      phone: member.phone,
      category: 'membership',
      lineItems: [{ label: `CHM Premium membership (per ${premiumPeriodLabel(billing)})`, amount }],
      total: amount,
      amountPaid: amount,
      paymentKind: 'full',
    })
    await sendUserEmailHtml(member.email, invoiceSubject(invoice), buildInvoiceHtml(invoice)).catch(e =>
      console.error('[premium] invoice email error:', e)
    )
  } catch (e) {
    console.error('[premium] invoice error (charge', charge.chargeId, '):', e)
  }

  return NextResponse.json({ success: true, nextChargeDate: next, amount })
}
