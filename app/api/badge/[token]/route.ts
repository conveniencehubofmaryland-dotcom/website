import { NextRequest, NextResponse } from 'next/server'
import { serviceHeaders } from '@/lib/supabase-keys'
import { buildBadgeHtml, getStaffPhotoDataUri } from '@/lib/staff-badge'

// Serves the printable staff badge to an applicant who holds a valid claim link (valid 30 days).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const nowIso = new Date().toISOString()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?claim_shift_token=eq.${token}&claim_shift_token_expires_at=gt.${encodeURIComponent(nowIso)}&select=id,full_name,position`,
    { headers: { ...serviceHeaders() } }
  )
  const rows = res.ok ? await res.json() : []
  const applicant = Array.isArray(rows) ? rows[0] : null
  if (!applicant) {
    return new NextResponse('This badge link has expired. Please contact CHM at 202-579-2944.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const photoDataUri = await getStaffPhotoDataUri(applicant.id)
  const html = buildBadgeHtml({
    fullName: applicant.full_name,
    position: applicant.position,
    applicantId: applicant.id,
    issuedOn: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    photoDataUri,
  })

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
