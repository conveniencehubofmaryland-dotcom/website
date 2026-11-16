// CHM staff badge: a printable ID card (standard ID-card size) for each applicant who completes onboarding.
import { serviceHeaders } from './supabase-keys'

// The staff photo from the welcome form, as embedded image data so the badge prints without internet access.
export async function getStaffPhotoDataUri(applicantId: string): Promise<string | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/staff_documents?staff_id=eq.${applicantId}&document_type=eq.staff_photo&select=document_url&order=uploaded_at.desc&limit=1`,
    { headers: { ...serviceHeaders() } }
  )
  const rows = res.ok ? await res.json() : []
  const url = Array.isArray(rows) && rows[0]?.document_url ? String(rows[0].document_url) : null
  if (!url) return null
  const img = await fetch(url)
  if (!img.ok) return null
  const type = img.headers.get('content-type') || 'image/jpeg'
  if (!/^image\/(jpeg|png)$/.test(type)) return null
  return `data:${type};base64,${Buffer.from(await img.arrayBuffer()).toString('base64')}`
}

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Short, readable badge number taken from the applicant's record id.
export function badgeIdFor(applicantId: string): string {
  return applicantId.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export function buildBadgeHtml(opts: {
  fullName: string
  position: string | null
  applicantId: string
  issuedOn: string
  photoDataUri?: string | null
}): string {
  const name = esc(opts.fullName)
  const badgeId = esc(badgeIdFor(opts.applicantId))
  const issued = esc(opts.issuedOn)
  // Only embedded image data is allowed here, so the badge never loads anything from outside.
  const photo = opts.photoDataUri && /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(opts.photoDataUri)
    ? `<img class="photo" src="${opts.photoDataUri}" alt="Staff photo" />`
    : ''
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CHM Staff Badge - ${name}</title>
    <style>
      @page { size: 3.375in 2.125in; margin: 0; }
      body { margin: 0; font-family: Arial, sans-serif; background: #eee; }
      .card {
        width: 3.375in; height: 2.125in; box-sizing: border-box; margin: 20px auto;
        background: #ffffff; border: 2px solid #c41e3a; border-radius: 8px; overflow: hidden;
        display: flex; flex-direction: column;
      }
      .top { background: #c41e3a; color: #ffffff; padding: 6px 10px; }
      .brand { font-size: 11px; font-weight: bold; letter-spacing: 2px; }
      .role { font-size: 9px; letter-spacing: 1px; text-transform: uppercase; }
      .body { padding: 8px 12px; flex: 1; color: #1a1a1a; }
      .name { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
      .position { font-size: 11px; margin-bottom: 6px; }
      .meta { font-size: 8px; color: #555; }
      .body { overflow: hidden; }
      .photo { float: left; width: 0.8in; height: 1.0in; object-fit: cover; margin-right: 8px; border: 1px solid #c41e3a; border-radius: 4px; }
      .notice { font-size: 8px; color: #c41e3a; font-weight: bold; margin-top: 4px; }
      @media print {
        body { background: #ffffff; }
        .card { margin: 0; border-radius: 0; }
        .help { display: none; }
      }
      .help { max-width: 560px; margin: 20px auto; font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="top">
        <div class="brand">CONVENIENCE HUB OF MARYLAND</div>
        <div class="role">Staff Identification</div>
      </div>
      <div class="body">
        ${photo}
        <div class="name">${name}</div>
        <div class="position">CHM CONTRACTOR</div>
        <div class="meta">Badge ID: ${badgeId} &middot; Issued: ${issued}</div>
        <div class="notice">Show this badge to the client before entering the home.</div>
      </div>
    </div>
    <div class="help">
      <p><strong>Printing instructions:</strong> Open this page or file in a web browser, press Print (Ctrl+P or Cmd+P), and print at 100% scale on card or regular paper. Cut along the red border, then laminate the card before your first job.</p>
    </div>
  </body>
</html>`
}
