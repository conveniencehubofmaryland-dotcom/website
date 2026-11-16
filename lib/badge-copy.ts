import { buildBadgeHtml, getStaffPhotoDataUri } from './staff-badge'
import { serviceHeaders } from './supabase-keys'
import { sbFetch } from './shift-eligibility'

const BUCKET = 'application-documents'

// The stored badge file for an applicant. Only one copy is kept: the latest.
export function badgeFilePath(applicantId: string): string {
  return `badges/${applicantId}.html`
}

// Saves a copy of the staff badge in the admin Documents list when the applicant is marked Ready.
// The copy is viewable only through the admin route, because it shows the staff photo and name.
export async function saveBadgeCopy(applicantId: string, fullName: string, position: string | null): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return

  const photoDataUri = await getStaffPhotoDataUri(applicantId)
  const html = buildBadgeHtml({
    fullName,
    position,
    applicantId,
    issuedOn: new Date().toLocaleDateString('en-US'),
    photoDataUri,
  })

  const upload = await fetch(`${url}/storage/v1/object/${BUCKET}/${badgeFilePath(applicantId)}`, {
    method: 'POST',
    headers: { ...serviceHeaders(), 'Content-Type': 'text/html; charset=utf-8', 'x-upsert': 'true' },
    body: html,
  })
  if (!upload.ok) {
    console.error('[badge-copy] upload failed:', await upload.text())
    return
  }

  // Replace any earlier badge copy for this applicant.
  await sbFetch(`staff_documents?staff_id=eq.${encodeURIComponent(applicantId)}&document_type=eq.staff_badge`, {
    method: 'DELETE',
    headers: { Prefer: 'return=minimal' },
  })
  await sbFetch('staff_documents', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      staff_id: applicantId,
      document_type: 'staff_badge',
      document_url: `https://conveniencehubofmaryland.com/api/admin/staff-documents/badge/${applicantId}`,
      status: 'issued',
      notes: 'Badge copy saved when the applicant was marked Ready',
      uploaded_at: new Date().toISOString(),
    }),
  })
}
