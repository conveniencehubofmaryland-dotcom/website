import { NextRequest, NextResponse } from 'next/server'
import { sbFetch, todayInEastern } from '@/lib/shift-eligibility'
import { sendAdminEmail, sendUserEmailHtml } from '@/lib/email'
import { buildInvoiceHtml, createInvoice, invoiceSubject } from '@/lib/invoice'
import { chargeCloverCustomer, isRecurringFrequency, nextChargeDate } from '@/lib/recurring'

// Charges every active recurring plan that is due today or earlier (Eastern time).
// Called once a day by an outside scheduler with the header x-cron-secret.
// A plan is paused after 3 failed charges in a row, and admin is told.
const MAX_FAILURES = 3
const MAX_PER_RUN = 100

type Plan = {
  id: string
  client_name: string | null
  client_email: string
  client_phone: string | null
  service_category: string | null
  frequency: string
  amount: number
  clover_customer_id: string
  next_charge_date: string
  failed_attempts: number
}

export async function GET(request: NextRequest) {
  return runCharges(request)
}

export async function POST(request: NextRequest) {
  return runCharges(request)
}

async function runCharges(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = todayInEastern()
  const res = await sbFetch(
    `recurring_plans?status=eq.active&next_charge_date=lte.${today}&order=next_charge_date.asc&limit=${MAX_PER_RUN}&select=*`
  )
  if (!res.ok) return NextResponse.json({ error: 'Could not load plans' }, { status: 500 })
  const plans = (await res.json()) as Plan[]

  const results: { id: string; status: 'charged' | 'failed' | 'paused'; detail?: string }[] = []

  for (const plan of plans) {
    if (!isRecurringFrequency(plan.frequency)) {
      results.push({ id: plan.id, status: 'failed', detail: 'Unknown frequency' })
      continue
    }

    // The key is tied to the plan and the due date, so a retry never charges the same cycle twice.
    const charge = await chargeCloverCustomer(
      plan.clover_customer_id,
      Number(plan.amount),
      `recurring-${plan.id}-${plan.next_charge_date}`
    )

    if (charge.ok) {
      try {
        const invoice = await createInvoice({
          chargeId: charge.chargeId,
          name: plan.client_name || '',
          email: plan.client_email,
          phone: plan.client_phone || '',
          category: plan.service_category || '',
          lineItems: [{ label: `Recurring service, every ${plan.frequency}`, amount: Number(plan.amount) }],
          total: Number(plan.amount),
          amountPaid: Number(plan.amount),
          paymentKind: 'full',
        })
        await sendUserEmailHtml(plan.client_email, invoiceSubject(invoice), buildInvoiceHtml(invoice)).catch(e =>
          console.error('[recurring-cron] invoice email error:', e)
        )
      } catch (e) {
        console.error('[recurring-cron] invoice error (charge', charge.chargeId, '):', e)
      }

      const next = nextChargeDate(plan.next_charge_date, plan.frequency)
      await sbFetch(`recurring_plans?id=eq.${plan.id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          next_charge_date: next,
          last_charge_at: new Date().toISOString(),
          failed_attempts: 0,
          last_error: null,
        }),
      })
      results.push({ id: plan.id, status: 'charged', detail: `next ${next}` })
      continue
    }

    const failures = (Number(plan.failed_attempts) || 0) + 1
    const pause = failures >= MAX_FAILURES
    await sbFetch(`recurring_plans?id=eq.${plan.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        failed_attempts: failures,
        last_error: charge.error.slice(0, 300),
        ...(pause ? { status: 'paused' } : {}),
      }),
    })

    if (pause) {
      await sendAdminEmail(
        `Recurring plan paused: ${plan.client_name || plan.client_email}`,
        `The ${plan.frequency} charge of $${Number(plan.amount).toFixed(2)} failed ${failures} times in a row, so the plan is paused. Last error: ${charge.error}. Contact the client to update their card.`
      ).catch(e => console.error('[recurring-cron] admin email error:', e))
      results.push({ id: plan.id, status: 'paused', detail: charge.error })
    } else {
      results.push({ id: plan.id, status: 'failed', detail: charge.error })
    }
  }

  return NextResponse.json({ checked: plans.length, results })
}
