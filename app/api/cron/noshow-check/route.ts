import { NextRequest, NextResponse } from 'next/server'
import { sbFetch, todayInEastern } from '@/lib/shift-eligibility'
import { recordNoShow } from '@/lib/no-show'

// Automatic no-show check. Called every hour by an outside scheduler with the header x-cron-secret.
// A claimed shift is marked a no-show when it has no clock-in and its start time was more than
// GRACE_MINUTES ago (Eastern time). The staff member is emailed, as with a manual mark.
const GRACE_MINUTES = 60
const MAX_PER_RUN = 200

type Due = { id: string; applicant_id: string; date: string; start_time: string | null }

function easternNowMinutes(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const hour = Number(parts.find(p => p.type === 'hour')?.value) % 24
  const minute = Number(parts.find(p => p.type === 'minute')?.value)
  return hour * 60 + minute
}

function minutesOf(time: string | null): number {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export async function GET(request: NextRequest) {
  return runCheck(request)
}

export async function POST(request: NextRequest) {
  return runCheck(request)
}

async function runCheck(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = todayInEastern()
  const nowMin = easternNowMinutes()

  const res = await sbFetch(
    `shifts?status=eq.claimed&clock_in_at=is.null&applicant_id=not.is.null&date=lte.${today}&order=date.asc&limit=${MAX_PER_RUN}&select=id,applicant_id,date,start_time`
  )
  if (!res.ok) return NextResponse.json({ error: 'Could not load shifts' }, { status: 500 })
  const shifts = (await res.json()) as Due[]

  const results: { shiftId: string; status: 'marked' | 'skipped' | 'error'; detail?: string }[] = []

  for (const shift of shifts) {
    // Earlier days are always past. Today's shift counts once its start time plus the grace period has passed.
    const passed = shift.date < today || (shift.date === today && nowMin >= minutesOf(shift.start_time) + GRACE_MINUTES)
    if (!passed) {
      results.push({ shiftId: shift.id, status: 'skipped', detail: 'Not yet past the grace period' })
      continue
    }

    try {
      const outcome = await recordNoShow({
        applicantId: shift.applicant_id,
        shiftId: shift.id,
        markedBy: 'auto',
      })
      if (outcome.ok) {
        results.push({ shiftId: shift.id, status: 'marked', detail: `${outcome.applicantName}: ${outcome.noShowCount} no-shows` })
      } else {
        results.push({ shiftId: shift.id, status: 'skipped', detail: outcome.error })
      }
    } catch (e) {
      console.error('[noshow-check] error for shift', shift.id, e)
      results.push({ shiftId: shift.id, status: 'error', detail: 'Could not record' })
    }
  }

  return NextResponse.json({ checked: shifts.length, results })
}
