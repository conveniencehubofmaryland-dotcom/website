import crypto from 'crypto'

// Recurring billing: the client's card is saved with Clover as a customer, then charged each cycle.
// Uses the same Clover key and base address as one-time payments (CLOVER_PRIVATE_KEY, CLOVER_API_BASE).

export type Frequency = 'weekly' | 'biweekly' | 'monthly'
export const RECURRING_FREQUENCIES: Frequency[] = ['weekly', 'biweekly', 'monthly']

export function isRecurringFrequency(v: unknown): v is Frequency {
  return typeof v === 'string' && (RECURRING_FREQUENCIES as string[]).includes(v)
}

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  weekly: 'week',
  biweekly: 'two weeks',
  monthly: 'month',
}

// The next charge date after `from` (YYYY-MM-DD). Monthly keeps the same day, or the last day of shorter months.
export function nextChargeDate(from: string, frequency: Frequency): string {
  const d = new Date(`${from}T12:00:00Z`)
  if (frequency === 'weekly') {
    d.setUTCDate(d.getUTCDate() + 7)
  } else if (frequency === 'biweekly') {
    d.setUTCDate(d.getUTCDate() + 14)
  } else {
    const day = d.getUTCDate()
    d.setUTCDate(1)
    d.setUTCMonth(d.getUTCMonth() + 1)
    const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
    d.setUTCDate(Math.min(day, lastDay))
  }
  return d.toISOString().slice(0, 10)
}

function cloverHeaders(idempotencyKey?: string): Record<string, string> | null {
  const key = process.env.CLOVER_PRIVATE_KEY
  if (!key) return null
  const h: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
    authorization: `Bearer ${key}`,
  }
  if (idempotencyKey) h['idempotency-key'] = idempotencyKey
  return h
}

function cloverBase(): string | null {
  const base = process.env.CLOVER_API_BASE
  return base ? base.replace(/\/$/, '') : null
}

// Saves the card (from a one-time card token) as a Clover customer. Returns the customer id.
export async function createCloverCustomer(input: {
  email: string
  name: string
  token: string
}): Promise<{ ok: true; customerId: string } | { ok: false; error: string }> {
  const base = cloverBase()
  const headers = cloverHeaders()
  if (!base || !headers) return { ok: false, error: 'Recurring billing is not set up yet. Please call 202-579-2944.' }
  const parts = input.name.trim().split(/\s+/)
  try {
    const res = await fetch(`${base}/v1/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: input.email,
        firstName: parts[0] || 'Client',
        lastName: parts.slice(1).join(' ') || '-',
        source: input.token,
      }),
      signal: AbortSignal.timeout(20000),
    })
    const raw = await res.text()
    let data: { id?: string } = {}
    try {
      data = JSON.parse(raw)
    } catch {
      data = {}
    }
    if (!res.ok || !data.id) {
      console.error('[recurring] customer failed:', res.status, raw.slice(0, 300))
      return { ok: false, error: 'The card could not be saved for recurring billing. Please try again or call 202-579-2944.' }
    }
    return { ok: true, customerId: data.id }
  } catch (e) {
    console.error('[recurring] customer error:', e)
    return { ok: false, error: 'The card could not be saved right now. Please try again.' }
  }
}

// Charges a saved customer card. The idempotency key stops a retry from charging twice.
export async function chargeCloverCustomer(
  customerId: string,
  amount: number,
  idempotencyKey: string
): Promise<{ ok: true; chargeId: string } | { ok: false; error: string }> {
  const base = cloverBase()
  const headers = cloverHeaders(idempotencyKey)
  if (!base || !headers) return { ok: false, error: 'Recurring billing is not set up yet.' }
  try {
    const res = await fetch(`${base}/v1/charges`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'usd', source: customerId }),
      signal: AbortSignal.timeout(20000),
    })
    const raw = await res.text()
    let data: { id?: string; status?: string } = {}
    try {
      data = JSON.parse(raw)
    } catch {
      data = {}
    }
    if (!res.ok || !data.id || data.status === 'failed' || data.status === 'declined') {
      console.error('[recurring] charge failed:', res.status, raw.slice(0, 300))
      return { ok: false, error: `Charge not completed (Clover ${res.status})` }
    }
    return { ok: true, chargeId: data.id }
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    console.error('[recurring] charge error:', reason)
    return { ok: false, error: `Charge could not be processed: ${reason.slice(0, 200)}` }
  }
}

export const SITE_URL = 'https://conveniencehubofmaryland.com'

// Private key for a plan's management link. Long and random, so it cannot be guessed.
export function newManageToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

export function manageUrl(token: string): string {
  return `${SITE_URL}/plan/${token}`
}

export type PlanAction = 'pause' | 'resume' | 'cancel'

// Works out the database change for a pause, resume or cancel.
// Customers cannot restart a cancelled plan; admin can.
// A resumed plan waits one full cycle from today before its next charge.
export function planActionPatch(
  plan: { status: string; frequency: string },
  action: PlanAction,
  today: string,
  byAdmin: boolean
): { ok: true; patch: Record<string, unknown> } | { ok: false; error: string } {
  if (action === 'pause') {
    if (plan.status !== 'active') return { ok: false, error: 'Only an active plan can be paused.' }
    return { ok: true, patch: { status: 'paused', paused_at: new Date().toISOString() } }
  }
  if (action === 'resume') {
    if (plan.status === 'active') return { ok: false, error: 'This plan is already active.' }
    if (plan.status === 'cancelled' && !byAdmin) {
      return { ok: false, error: 'This plan was cancelled. Please call or text 202-579-2944 to restart it.' }
    }
    if (!isRecurringFrequency(plan.frequency)) return { ok: false, error: 'This plan has an unknown schedule.' }
    return {
      ok: true,
      patch: {
        status: 'active',
        next_charge_date: nextChargeDate(today, plan.frequency),
        failed_attempts: 0,
        last_error: null,
        paused_at: null,
        cancelled_at: null,
      },
    }
  }
  if (plan.status === 'cancelled') return { ok: false, error: 'This plan is already cancelled.' }
  return { ok: true, patch: { status: 'cancelled', cancelled_at: new Date().toISOString() } }
}
