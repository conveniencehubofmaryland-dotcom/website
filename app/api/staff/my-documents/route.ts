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

const UPLOAD_LABELS: Record<string, string> = {
  direct_deposit: 'Direct Deposit Form or Voided Check',
  cpr_certification: 'CPR Certificate',
  first_aid_certification: 'First Aid Certificate',
  cmt_certificate: 'CMT Certificate',
  cna_certificate: 'CNA Certificate',
  staff_photo: 'Staff Photo',
}

// Staff: only the signed-in person's own documents, certificates and badge.
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
  const moduleIds = Array.from(new Set(certs.map(c => c.module_id)))
  const modRes = moduleIds.length
    ? await sbFetch(`training_modules?id=in.(${moduleIds.map(m => encodeURIComponent(m)).join(',')})&select=id,title`)
    : null
  const titles = new Map<string, string>(modRes && modRes.ok ? ((await modRes.json()) as { id: string; title: string }[]).map(m => [m.id, m.title]) : [])
  for (const c of certs) {
    items.push({
      id: c.id,
      kind: 'certificate',
      name: `Training Certificate: ${titles.get(c.module_id) || 'training module'}`,
      date: c.completed_at,
      review: (c.review_status as Item['review']) || 'pending',
      url: c.certificate_url,
    })
  }

  // Uploaded forms and certificates from the welcome profile.
  const docRes = await sbFetch(
    `staff_documents?staff_id=eq.${id}&document_type=neq.staff_badge&select=id,document_type,document_url,uploaded_at,review_status&order=uploaded_at.desc`
  )
  const docs = docRes.ok ? ((await docRes.json()) as { id: string; document_type: string; document_url: string | null; uploaded_at: string; review_status: string | null }[]) : []
  for (const d of docs) {
    items.push({
      id: d.id,
      kind: 'upload',
      name: UPLOAD_LABELS[d.document_type] || d.document_type,
      date: d.uploaded_at,
      review: (d.review_status as Item['review']) || 'pending',
      url: d.document_url,
    })
  }

  // The W-9 they submitted.
  const w9Res = await sbFetch(`w9_forms?applicant_id=eq.${id}&select=id,signed_at,created_at,file_path&order=created_at.desc&limit=1`)
  const w9s = w9Res.ok ? ((await w9Res.json()) as { id: string; signed_at: string | null; created_at: string; file_path: string | null }[]) : []
  for (const w of w9s) {
    items.push({
      id: w.id,
      kind: 'w9',
      name: 'IRS Form W-9',
      date: w.signed_at || w.created_at,
      review: null,
      url: w.file_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-documents/${w.file_path.split('/').map(encodeURIComponent).join('/')}`
        : null,
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
