import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { sbFetch, todayInEastern } from '@/lib/shift-eligibility'
import { planActionPatch, type PlanAction } from '@/lib/recurring'

// Admin view of recurring plans. Admin can pause, resume or cancel any plan, and add a note.
// GET                       list plans (newest first)
// POST {id, action?, note?} action = pause | resume | cancel; note saves an internal note
const ACTIONS: PlanAction[] = ['pause', 'resume', 'cancel']
const UUID = /^[0-9a-f-]{36}$/i

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const res = await sbFetch(
    'recurring_plans?select=id,client_name,client_email,client_phone,service_category,frequency,recurring_amount,amount,status,next_charge_date,last_charge_at,failed_attempts,last_error,paused_at,cancelled_at,admin_note,created_at&order=created_at.desc&limit=500'
  )
  if (!res.ok) return NextResponse.json({ error: 'Could not load plans.' }, { status: 500 })
  return NextResponse.json({ plans: await res.json() })
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  let body: { id?: unknown; action?: unknown; note?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const id = typeof body.id === 'string' ? body.id : ''
  if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })

  const lookup = await sbFetch(`recurring_plans?id=eq.${id}&select=id,status,frequency&limit=1`)
  const rows = lookup.ok ? ((await lookup.json()) as { id: string; status: string; frequency: string }[]) : []
  const plan = rows[0]
  if (!plan) return NextResponse.json({ error: 'Plan not found.' }, { status: 404 })

  const patch: Record<string, unknown> = {}
  if (typeof body.note === 'string') patch.admin_note = body.note.trim().slice(0, 1000) || null

  if (body.action !== undefined) {
    const action = body.action as PlanAction
    if (!ACTIONS.includes(action)) return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    const change = planActionPatch(plan, action, todayInEastern(), true)
    if (!change.ok) return NextResponse.json({ error: change.error }, { status: 409 })
    Object.assign(patch, change.patch)
  }

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 })

  const save = await sbFetch(`recurring_plans?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  })
  if (!save.ok) return NextResponse.json({ error: 'The change could not be saved.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
