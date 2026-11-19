import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { computeQuote, type Selections } from '@/lib/quote-pricing'
import { loadServicePrices } from '@/lib/service-prices'
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
  manageUrl,
  newManageToken,
  nextChargeDate,
} from '@/lib/recurring'

// Sets up a recurring plan: saves the card, takes the first cycle now, and records the plan.
// The first cycle can include the first-time discount. Later cycles use the regular recurring price
// (the first-time discount is removed; the recurring and member discounts stay).
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
  const prices = await loadServicePrices()

  // First cycle: the quote as the client sees it (may include the first-time discount).
  const firstQuote = computeQuote(category, selections, { member, realtor: false, prices })
  // Later cycles: the same quote without the first-time discount.
  const recurringQuote = computeQuote(category, { ...selections, firstTime: false }, { member, realtor: false, prices })
  if (firstQuote.total === null || firstQuote.total < 1 || recurringQuote.total === null || recurringQuote.total < 1) {
    return NextResponse.json(
      { error: 'This quote needs a personal review. Please call 202-579-2944 to set up a plan.' },
      { status: 400 }
    )
  }
  const amount = Math.round(firstQuote.total * 100) / 100
  const recurringAmount = Math.round(recurringQuote.total * 100) / 100

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
  const manageToken = newManageToken()

  // 3. Record the plan. `amount` is the first payment; `recurring_amount` is what later cycles charge.
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
      recurring_amount: recurringAmount,
      selections,
      clover_customer_id: customer.customerId,
      status: 'active',
      next_charge_date: next,
      last_charge_at: new Date().toISOString(),
      consent_at: new Date().toISOString(),
      manage_token: manageToken,
    }),
  })
  if (!planRes.ok) {
    // The first payment was taken but the plan was not saved, so it will not repeat. Tell admin right away.
    console.error('[recurring] plan not saved; first charge', charge.chargeId, 'status', planRes.status)
    await sendAdminEmail(
      `URGENT: recurring plan NOT saved for ${name || email}`,
      `The first payment of $${amount.toFixed(2)} was taken (reference ${charge.chargeId}), but the plan could not be saved, so it will NOT repeat automatically. Set up the next charge by hand, and contact the client.`
    ).catch(e => console.error('[recurring] admin email error:', e))
  }

  // The link only works if the plan was saved, so it is left out otherwise.
  const link = planRes.ok ? manageUrl(manageToken) : ''

  // 4. Invoice for the first cycle, emailed to the client; copy to admin.
  try {
    const invoice = await createInvoice({
      chargeId: charge.chargeId,
      name,
      email,
      phone,
      category,
      lineItems: firstQuote.breakdown.map(b => ({ label: b.label, amount: b.amount })),
      total: amount,
      amountPaid: amount,
      paymentKind: 'full',
    })
    const manageNote = link
      ? `<p style="font-size:13px;color:#555">Manage your recurring plan (pause, resume or cancel any time): <a href="${link}" style="color:#E8192C">${link}</a></p>`
      : ''
    await sendUserEmailHtml(email, invoiceSubject(invoice), buildInvoiceHtml(invoice, manageNote)).catch(e =>
      console.error('[recurring] invoice email error:', e)
    )
    await sendAdminEmail(
      `Recurring plan started: ${name || email}`,
      `${name || 'Client'} (${email}, ${phone || 'no phone'}) set up a ${frequency} plan. First payment $${amount.toFixed(2)}, then $${recurringAmount.toFixed(2)} each cycle. Invoice ${invoice.invoice_number}. Next charge: ${next}.`
    ).catch(e => console.error('[recurring] admin email error:', e))
  } catch (e) {
    console.error('[recurring] invoice error:', e)
  }

  // 5. Plan confirmation to the client.
  const firstNote =
    amount !== recurringAmount
      ? `<p>Your first payment of <strong>$${amount.toFixed(2)}</strong> includes your first-time discount. Each payment after that is <strong>$${recurringAmount.toFixed(2)}</strong>.</p>`
      : ''
  await sendUserEmailHtml(
    email,
    'Your recurring service plan is set up',
    brandedEmailHtml(`<h2 style="color:#E8192C;margin:0 0 12px 0">Your plan is set up${name ? `, ${name.split(' ')[0]}` : ''}</h2>
<p>You are signed up for a recurring plan at <strong>$${recurringAmount.toFixed(2)}</strong> every ${FREQUENCY_LABEL[frequency]}.</p>
${firstNote}
<p>Your next charge will be on <strong>${next}</strong> to the card you provided.</p>
${link ? `<p>You can pause, resume or cancel any time on this page: <a href="${link}" style="color:#E8192C">${link}</a></p>` : ''}
<p>You can also call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.</p>`)
  ).catch(e => console.error('[recurring] confirmation email error:', e))

  return NextResponse.json({ ok: true, chargeId: charge.chargeId, amount, nextChargeDate: next, recurringAmount })
}
