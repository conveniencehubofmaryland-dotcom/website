import { NextRequest, NextResponse } from 'next/server'
import {
  getApplicantBySession,
  createEligibilityChecker,
  sbFetch,
  type ShiftRow,
} from '@/lib/shift-eligibility'

export async function GET(request: NextRequest) {
  try {
    const applicant = await getApplicantBySession(request.nextUrl.searchParams.get('token'))
    if (!applicant) {
      return NextResponse.json({ error: 'Please sign in to see shifts.' }, { status: 401 })
    }

    const res = await sbFetch('shifts?status=eq.available&order=date.asc,start_time.asc&select=*')
    if (!res.ok) {
      console.error('[shifts] Supabase error:', res.status, await res.text())
      return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 })
    }

    const shifts = (await res.json()) as ShiftRow[]
    const check = createEligibilityChecker(applicant)
    const eligible: ShiftRow[] = []
    for (const shift of shifts) {
      if ((await check(shift)).eligible) eligible.push(shift)
    }
    return NextResponse.json(eligible)
  } catch (error) {
    console.error('[shifts] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 })
  }
}
