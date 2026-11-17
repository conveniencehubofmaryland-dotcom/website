import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession, sbFetch } from '@/lib/shift-eligibility'

type Item = {
  id: string
  kind: 'certificate' | 'upload' | 'w9' | 'badge'
  name: string
  date: string | null
  review: 'pending' | 'cleared' | 'not_cleared' | null
  url: string | null
}

// Staff: only the signed-in person's CHM certifications and staff badge.
export async function GET(req: NextRequest) {
  let applicant
  try {
    applicant = await getApplicantBySession(req.headers.get('x-staff-token'))
  } catch {
    return NextResponse.json({ error: 'We could not check your sign-in right now.' }, { status: 503 })
  }
  if (!applicant) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })

  const id = encodeURIComponent(applicant.id)
  const email = encodeURIComponent(applicant.email)
  const items: Item[] = []

  // Certificates from passed training modules.
  const certRes = await sbFetch(
    `staff_module_progress?staff_email=ilike.${email}&status=eq.completed&select=id,completed_at,certificate_url,review_status,module_id&order=completed_at.desc`
  )
  const certs = certRes.ok ? ((await certRes.json()) as { id: string; completed_at: string; certificate_url: string | null; review_status: string | null; module_id: string }[]) : []
  for (const c of certs) {
    items.push({
      id: c.id,
      kind: 'certificate',
      name: 'CHM Certification',
      date: c.completed_at,
      review: (c.review_status as Item['review']) || 'pending',
      url: c.certificate_url,
    })
  }

  // The staff badge, through its own link (valid while the badge link is active).
  const tokRes = await sbFetch(`offer_letter_applicants?id=eq.${id}&select=claim_shift_token,claim_shift_token_expires_at`)
  const [tok] = tokRes.ok ? ((await tokRes.json()) as { claim_shift_token: string | null; claim_shift_token_expires_at: string | null }[]) : []
  if (tok?.claim_shift_token && tok.claim_shift_token_expires_at && new Date(tok.claim_shift_token_expires_at) > new Date()) {
    items.push({
      id: applicant.id,
      kind: 'badge',
      name: 'CHM Staff Badge',
      date: null,
      review: null,
      url: `https://conveniencehubofmaryland.com/api/badge/${tok.claim_shift_token}`,
    })
  }

  return NextResponse.json({ items })
}
