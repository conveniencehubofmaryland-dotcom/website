import { NextRequest, NextResponse } from 'next/server'
import { sbFetch, todayInEastern } from '@/lib/shift-eligibility'
import { FREQUENCY_LABEL, isRecurringFrequency, planActionPatch, type PlanAction } from '@/lib/recurring'

// Customer self-service for a recurring plan. The private link key in the URL is the only way in.
// GET  ?token=...                 shows the plan
// POST {token, action}            action = pause | resume | cancel
const TOKEN = /^[A-Za-z0-9_-]{40,80}$/
const ACTIONS: PlanAction[] = ['pause', 'resume', 'cancel']

const PLAN_FIELDS = 'id,status,frequency,recurring_amount,amount,next_charge_date,service_category,client_name,cancelled_at,paused_at'

const noStore = { 'Cache-Control': 'no-store' }

async function loadPlan(token: string) {
  const res = await sbFetch(`recurring_plans?manage_token=eq.${token}&select=${PLAN_FIELDS}&limit=1`)
  if (!res.ok) return { error: 'server' as const }
  const rows = (await res.json()) as Record<string, unknown>[]
  return { plan: rows[0] ?? null }
}

function publicView(p: Record<string, unknown>) {
  const freq = isRecurringFrequency(p.frequency) ? FREQUENCY_LABEL[p.frequency] : String(p.frequency)
  return {
    status: p.status,
    frequency: freq,
    amount: Number(p.recurring_amount ?? p.amount),
    nextChargeDate: p.status === 'active' ? p.next_charge_date : null,
    service: p.service_category,
    name: p.client_name,
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  if (!TOKEN.test(token)) return NextResponse.json({ error: 'This link is not valid.' }, { status: 404, headers: noStore })
  const { plan, error } = await loadPlan(token)
  if (error) return NextResponse.json({ error: 'Please try again in a moment.' }, { status: 500, headers: noStore })
  if (!plan) return NextResponse.json({ error: 'This link is not valid.' }, { status: 404, headers: noStore })
  return NextResponse.json({ plan: publicView(plan) }, { headers: noStore })
}

export async function POST(request: NextRequest) {
  let body: { token?: unknown; action?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: noStore })
  }
  const token = typeof body.token === 'string' ? body.token : ''
  const action = body.action as PlanAction
  if (!TOKEN.test(token) || !ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'This link is not valid.' }, { status: 404, headers: noStore })
  }

  const { plan, error } = await loadPlan(token)
  if (error) return NextResponse.json({ error: 'Please try again in a moment.' }, { status: 500, headers: noStore })
  if (!plan) return NextResponse.json({ error: 'This link is not valid.' }, { status: 404, headers: noStore })

  const change = planActionPatch(
    { status: String(plan.status), frequency: String(plan.frequency) },
    action,
    todayInEastern(),
    false
  )
  if (!change.ok) return NextResponse.json({ error: change.error }, { status: 409, headers: noStore })

  const save = await sbFetch(`recurring_plans?id=eq.${plan.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(change.patch),
  })
  const rows = save.ok ? ((await save.json()) as Record<string, unknown>[]) : []
  if (!save.ok || rows.length === 0) {
    return NextResponse.json({ error: 'The change could not be saved. Please call or text 202-579-2944.' }, { status: 500, headers: noStore })
  }
  return NextResponse.json({ plan: publicView(rows[0]) }, { headers: noStore })
}
