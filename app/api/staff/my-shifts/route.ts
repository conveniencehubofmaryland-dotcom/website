import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession, loadShift, sbFetch, todayInEastern, type ShiftRow } from '@/lib/shift-eligibility'

// Staff: list my claimed shifts
export async function GET(request: NextRequest) {
  try {
    const applicant = await getApplicantBySession(request.nextUrl.searchParams.get('token'))
    if (!applicant) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

    const res = await sbFetch(
      `shifts?applicant_id=eq.${encodeURIComponent(applicant.id)}&order=date.asc,start_time.asc&select=*`
    )
    if (!res.ok) return NextResponse.json({ error: 'Failed to load shifts' }, { status: 500 })
    return NextResponse.json(await res.json())
  } catch (error) {
    console.error('[my-shifts] GET error:', error)
    return NextResponse.json({ error: 'Failed to load shifts' }, { status: 500 })
  }
}

// Staff: clock_in, clock_out, or confirm (completed)
export async function POST(request: NextRequest) {
  try {
    const { sessionToken, shiftId, action } = await request.json()
    if (!sessionToken || !shiftId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const applicant = await getApplicantBySession(sessionToken)
    if (!applicant) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

    const shift: ShiftRow | null = await loadShift(shiftId)
    if (!shift || shift.applicant_id !== applicant.id) {
      return NextResponse.json({ error: 'Shift not found for your account.' }, { status: 403 })
    }

    const now = new Date().toISOString()
    let patch: Record<string, unknown>

    if (action === 'clock_in') {
      if (shift.date !== todayInEastern()) {
        return NextResponse.json({ error: 'You can only clock in on the day of the shift.' }, { status: 400 })
      }
      if (shift.clock_in_at) return NextResponse.json({ error: 'You are already clocked in.' }, { status: 400 })
      if (shift.staff_confirmed_at) return NextResponse.json({ error: 'This shift is already confirmed.' }, { status: 400 })
      patch = { clock_in_at: now }
    } else if (action === 'clock_out') {
      if (!shift.clock_in_at) return NextResponse.json({ error: 'Clock in first.' }, { status: 400 })
      if (shift.clock_out_at) return NextResponse.json({ error: 'You already clocked out.' }, { status: 400 })
      const minutes = Math.round((Date.parse(now) - Date.parse(shift.clock_in_at)) / 60000)
      patch = { clock_out_at: now, hours_worked: Math.round((minutes / 60) * 100) / 100 }
    } else if (action === 'confirm') {
      if (!shift.clock_out_at) return NextResponse.json({ error: 'Clock out before confirming.' }, { status: 400 })
      if (shift.staff_confirmed_at) return NextResponse.json({ error: 'Already confirmed.' }, { status: 400 })
      patch = { staff_confirmed_at: now }
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const res = await sbFetch(`shifts?id=eq.${encodeURIComponent(shiftId)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(patch),
    })
    if (!res.ok) {
      console.error('[my-shifts] PATCH failed:', await res.text())
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[my-shifts] POST error:', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
