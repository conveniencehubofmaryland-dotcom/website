import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession, sbFetch } from '@/lib/shift-eligibility'

// Staff: see their own missed-shift record. Only the signed-in person's rows are returned.
const NO_SHOW_CLAIM_LIMIT = 2

export async function GET(request: NextRequest) {
  try {
    const applicant = await getApplicantBySession(request.nextUrl.searchParams.get('token'))
    if (!applicant) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })

    const countRes = await sbFetch(`offer_letter_applicants?id=eq.${encodeURIComponent(applicant.id)}&select=no_show_count`)
    const countRows = countRes.ok ? ((await countRes.json()) as { no_show_count: number | null }[]) : []
    const count = Number(countRows[0]?.no_show_count) || 0

    const logRes = await sbFetch(
      `no_show_log?applicant_id=eq.${encodeURIComponent(applicant.id)}&select=shift_id,created_at&order=created_at.desc&limit=50`
    )
    if (!logRes.ok) return NextResponse.json({ error: 'Could not load your record.' }, { status: 500 })
    const logs = (await logRes.json()) as { shift_id: string; created_at: string }[]

    let items: { date: string; start_time: string | null; location: string | null; role: string | null; recorded_at: string }[] = []
    if (logs.length > 0) {
      const ids = logs.map(l => l.shift_id).filter(Boolean).join(',')
      const shiftRes = await sbFetch(`shifts?id=in.(${ids})&select=id,date,start_time,location,role`)
      const shifts = shiftRes.ok ? ((await shiftRes.json()) as { id: string; date: string; start_time: string | null; location: string | null; role: string | null }[]) : []
      const byId = new Map(shifts.map(s => [s.id, s]))
      items = logs.map(l => {
        const s = byId.get(l.shift_id)
        return {
          date: s?.date ?? '',
          start_time: s?.start_time ?? null,
          location: s?.location ?? null,
          role: s?.role ?? null,
          recorded_at: l.created_at,
        }
      })
    }

    return NextResponse.json({
      count,
      blocked: count >= NO_SHOW_CLAIM_LIMIT,
      items,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[staff/no-shows] GET error:', error)
    return NextResponse.json({ error: 'Could not load your record.' }, { status: 500 })
  }
}
