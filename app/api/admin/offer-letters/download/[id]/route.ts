import { requireAdmin } from '@/lib/admin-auth'
import { buildOfferLetterHtml } from '@/lib/offer-letter'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('offer_letters')
      .select('*, offer_letter_applicants(full_name, email, position)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const applicant = data.offer_letter_applicants
    const htmlContent = buildOfferLetterHtml({
      documentId: String(data.id),
      fullName: applicant?.full_name ?? '',
      email: applicant?.email ?? null,
      position: data.position || applicant?.position || '',
      startDate: data.start_date ?? null,
      signedAt: data.signed_at ?? null,
      signatureName: data.signature_name ?? null,
    })

    const safeName = String(applicant?.full_name ?? 'Staff').replace(/[^A-Za-z0-9_-]/g, '_')
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="OfferLetter-${safeName}.html"`,
      },
    })
  } catch (err) {
    console.error('[offer-letters download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
