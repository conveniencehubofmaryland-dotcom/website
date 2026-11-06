import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbPatchAuth } from '@/lib/db'
import { computeWorked, type ShiftRow } from '@/lib/shift-eligibility'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get('chm_admin')?.value ?? ''
}

// All shifts that have been claimed by a staff member
export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await dbSelectAuth<ShiftRow>('shifts', token, {
    order: 'date.asc',
    applicant_id: 'not.is.null',
  })
  return NextResponse.json(rows)
}

// Admin actions: approve, unapprove, or enter a missing clock-out time
export async function PATCH(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { shiftId, action, clockOutAt } = await req.json()
  if (!shiftId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const found = await dbSelectAuth<ShiftRow>('shifts', token, { id: `eq.${shiftId}` })
  const shift = found[0]
  if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })

  let patch: Record<string, unknown>

  if (action === 'approve') {
    if (!shift.clock_out_at) {
      return NextResponse.json({ error: 'Enter a clock-out time before approving.' }, { status: 400 })
    }
    patch = { approved_at: new Date().toISOString() }
  } else if (action === 'unapprove') {
    patch = { approved_at: null }
  } else if (action === 'set_clock_out') {
    if (shift.approved_at) {
      return NextResponse.json({ error: 'Unapprove this shift before changing its clock-out.' }, { status: 400 })
    }
    if (!shift.clock_in_at) {
      return NextResponse.json({ error: 'This staff member has not clocked in.' }, { status: 400 })
    }
    const out = new Date(clockOutAt)
    if (Number.isNaN(out.getTime())) {
      return NextResponse.json({ error: 'Invalid clock-out time.' }, { status: 400 })
    }
    if (out.getTime() <= Date.parse(shift.clock_in_at)) {
      return NextResponse.json({ error: 'Clock-out must be after clock-in.' }, { status: 400 })
    }
    const { hours } = computeWorked(shift.clock_in_at, out.toISOString())
    patch = { clock_out_at: out.toISOString(), hours_worked: hours }
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const { error } = await dbPatchAuth('shifts', shiftId, patch, token)
  if (error) {
    console.error('[admin/payroll] PATCH error:', error)
    return NextResponse.json({ error }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
