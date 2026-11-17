import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { computeQuote, type Selections } from '@/lib/quote-pricing'
import { isActiveMember } from '@/lib/membership'
import { sbFetch, todayInEastern } from '@/lib/shift-eligibility'
import { sendAdminEmail, sendUserEmailHtml } from '@/lib/email'
import { brandedEmailHtml } from '@/lib/email-brand'
import { buildInvoiceHtml, createInvoice, invoiceSubject } from '@/lib/invoice'
import {
  createCloverCustomer,
  chargeCloverCustomer,
  FREQUENCY_LABEL,
  isRecurringFrequency,
  nextChargeDate,
} from '@/lib/recurring'

// Sets up a recurring plan: saves the card, takes the first cycle now, and records the plan.
// The client must agree (consent). Referral codes are not used for recurring plans.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const token = typeof body.token === 'string' ? body.token : ''
  const category = typeof body.category === 'string' ? body.category : ''
  const selections = (body.selections && typeof body.selections === 'object' ? body.selections : {}) as Selections
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const referralCode = typeof body.referralCode === 'string' ? body.referralCode.trim() : ''
  const consent = body.consent === true

  if (!token.startsWith('clv_') || !category || !email) {
    return NextResponse.json({ error: 'Invalid payment details. Please try again.' }, { status: 400 })
  }
  if (!consent) {
    return NextResponse.json(
      { error: 'Please tick the box to agree to recurring billing before setting up the plan.' },
      { status: 400 }
    )
  }
  if (referralCode) {
    return NextResponse.json(
      { error: 'Referral codes cannot be used with a recurring plan. Please call 202-579-2944.' },
      { status: 400 }
    )
  }

  const frequency = (selections as Record<string, unknown>).frequency
  if (!isRecurringFrequency(frequency)) {
    return NextResponse.json(
      { error: 'Recurring billing is available for weekly, every two weeks, or monthly plans. Please call 202-579-2944 for other schedules.' },
      { status: 400 }
    )
  }

  const member = await isActiveMember(email)
  const quote = computeQuote(category, selections, { member, realtor: false })
  if (quote.total === null || quote.total < 1) {
    return NextResponse.json(
      { error: 'This quote needs a personal review. Please call 202-579-2944 to set up a plan.' },
      { status: 400 }
    )
  }
  const amount = Math.round(quote.total * 100) / 100

  // 1. Save the card with Clover.
  const customer = await createCloverCustomer({ email, name, token })
  if (!customer.ok) return NextResponse.json({ error: customer.error }, { status: 502 })

  // 2. Take the first cycle now.
  const firstKey = `recurring-first-${crypto.randomUUID()}`
  const charge = await chargeCloverCustomer(customer.customerId, amount, firstKey)
  if (!charge.ok) {
    return NextResponse.json(
      { error: `The first payment was not completed. ${charge.error}` },
      { status: 402 }
    )
  }

  const today = todayInEastern()
  const next = nextChargeDate(today, frequency)

  // 3. Record the plan. If this fails, the first charge is still recorded in the invoice below.
  const planRes = await sbFetch('recurring_plans', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      client_name: name || null,
      client_email: email,
      client_phone: phone || null,
      service_category: category,
      frequency,
      amount,
      selections,
      clover_customer_id: customer.customerId,
      status: 'active',
      next_charge_date: next,
      last_charge_at: new Date().toISOString(),
      consent_at: new Date().toISOString(),
    }),
  })
  if (!planRes.ok) {
    console.error('[recurring] plan not saved; first charge', charge.chargeId, 'status', planRes.status)
  }

  // 4. Invoice for the first cycle, emailed to the client; copy to admin.
  try {
    const invoice = await createInvoice({
      chargeId: charge.chargeId,
      name,
      email,
      phone,
      category,
      lineItems: quote.breakdown.map(b => ({ label: b.label, amount: b.amount })),
      total: amount,
      amountPaid: amount,
      paymentKind: 'full',
    })
    await sendUserEmailHtml(email, invoiceSubject(invoice), buildInvoiceHtml(invoice)).catch(e =>
      console.error('[recurring] invoice email error:', e)
    )
    await sendAdminEmail(
      `Recurring plan started: ${name || email}`,
      `${name || 'Client'} (${email}, ${phone || 'no phone'}) set up a ${frequency} plan for $${amount.toFixed(2)}. Invoice ${invoice.invoice_number}. Next charge: ${next}.`
    ).catch(e => console.error('[recurring] admin email error:', e))
  } catch (e) {
    console.error('[recurring] invoice error:', e)
  }

  // 5. Plan confirmation to the client.
  await sendUserEmailHtml(
    email,
    'Your recurring service plan is set up',
    brandedEmailHtml(`<h2 style="color:#E8192C;margin:0 0 12px 0">Your plan is set up${name ? `, ${name.split(' ')[0]}` : ''}</h2>
<p>You are signed up for a recurring plan at <strong>$${amount.toFixed(2)}</strong> every ${FREQUENCY_LABEL[frequency]}.</p>
<p>Your next charge will be on <strong>${next}</strong> to the card you provided. To pause or cancel, call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.</p>`)
  ).catch(e => console.error('[recurring] confirmation email error:', e))

  return NextResponse.json({ ok: true, chargeId: charge.chargeId, amount, nextChargeDate: next })
}
