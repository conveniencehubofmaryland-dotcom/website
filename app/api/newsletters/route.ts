import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession, sbFetch } from '@/lib/shift-eligibility'

// Clients: published client newsletters, public.
// Staff: published staff newsletters, only for a signed-in staff member.
export async function GET(req: NextRequest) {
  const audience = req.nextUrl.searchParams.get('audience')
  if (audience !== 'clients' && audience !== 'staff') {
    return NextResponse.json({ error: 'Choose clients or staff.' }, { status: 400 })
  }

  if (audience === 'staff') {
    let applicant = null
    try {
      applicant = await getApplicantBySession(req.headers.get('x-staff-token'))
    } catch {
      return NextResponse.json({ error: 'We could not check your sign-in right now.' }, { status: 503 })
    }
    if (!applicant) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })
  }

  const res = await sbFetch(
    `newsletters?audience=eq.${audience}&published=eq.true&select=id,title,body,created_at&order=created_at.desc&limit=50`
  )
  if (!res.ok) return NextResponse.json({ error: 'Could not load newsletters' }, { status: 500 })
  return NextResponse.json(await res.json())
}
