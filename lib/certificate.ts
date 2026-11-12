/* Builds and stores training certificates (saved once, when the quiz is passed). */

const CERT_BUCKET = 'application-documents'

function serviceKeyHeaders(): Record<string, string> | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!key) return null
  const h: Record<string, string> = { apikey: key }
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`
  return h
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Full certificate page: CHM official stamp plus a signed authorization line. */
export function buildCertificateHtml(opts: {
  id: string
  staffName: string
  moduleTitle: string
  score: number | null
  completedAt: string
}): string {
  const completedDate = new Date(opts.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const scoreText = opts.score == null ? 'N/A' : `${opts.score}%`
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Training Certificate</title>
    <style>
      body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; text-align: center; color: #1A1A1A; }
      h1 { font-size: 28px; margin: 20px 0; }
      .certificate-box { border: 3px solid #8B0000; padding: 40px; margin: 40px auto; max-width: 760px; background-color: #fffaf0; }
      .certificate-header { font-size: 24px; font-weight: bold; color: #8B0000; margin-bottom: 30px; }
      .certificate-text { font-size: 16px; margin: 15px 0; }
      .staff-name { font-size: 20px; font-weight: bold; margin: 20px 0; }
      .module-name { font-size: 18px; margin: 20px 0; }
      .score { font-size: 14px; color: #666; margin: 10px 0; }
      .signature-area { display: flex; justify-content: center; align-items: flex-end; gap: 48px; margin-top: 44px; flex-wrap: wrap; }
      .signature-block { width: 260px; }
      .signature-script { font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive; font-style: italic; font-size: 28px; color: #1a1a6e; margin: 0; }
      .signature-line { border-top: 1px solid #000; padding-top: 4px; }
      .signature-caption { font-size: 12px; color: #444; margin: 4px 0 0 0; }
      .stamp { width: 132px; height: 132px; border: 4px double #8B0000; border-radius: 50%; color: #8B0000; display: flex; align-items: center; justify-content: center; transform: rotate(-12deg); opacity: 0.9; }
      .stamp-inner { display: flex; flex-direction: column; align-items: center; line-height: 1.2; font-weight: bold; }
      .stamp-small { font-size: 9px; letter-spacing: 1px; }
      .stamp-large { font-size: 26px; letter-spacing: 2px; }
      .footer { font-size: 12px; color: #666; margin-top: 40px; }
    </style>
  </head>
  <body>
    <h1>CONVENIENCE HUB OF MARYLAND</h1>
    <div class="certificate-box">
      <div class="certificate-header">Certificate of Completion</div>
      <p class="certificate-text">This is to certify that</p>
      <p class="staff-name">${escapeHtml(opts.staffName)}</p>
      <p class="certificate-text">has successfully completed the training module</p>
      <p class="module-name">${escapeHtml(opts.moduleTitle)}</p>
      <p class="score">Quiz Score: ${scoreText}</p>
      <p class="certificate-text">On ${completedDate}</p>
      <p class="certificate-text">Signed and sealed by Convenience Hub of Maryland</p>
      <div class="signature-area">
        <div class="signature-block">
          <p class="signature-script">Convenience Hub of Maryland</p>
          <div class="signature-line"></div>
          <p class="signature-caption">Authorized Signature, CHM Management</p>
        </div>
        <div class="stamp" aria-label="CHM official stamp">
          <div class="stamp-inner">
            <span class="stamp-small">CONVENIENCE HUB</span>
            <span class="stamp-large">CHM</span>
            <span class="stamp-small">OF MARYLAND · OFFICIAL</span>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Convenience Hub of Maryland • 202-579-2944</p>
      <p style="color: #999;">Certificate ID: ${escapeHtml(opts.id)}</p>
    </div>
  </body>
</html>`
}

/** Uploads the certificate HTML to storage. Returns its public URL, or null if it failed. */
export async function storeCertificate(id: string, html: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const headers = serviceKeyHeaders()
  if (!url || !headers) return null
  const path = `certificates/${id}.html`
  try {
    const res = await fetch(`${url}/storage/v1/object/${CERT_BUCKET}/${path}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'x-upsert': 'true' },
      body: html,
    })
    if (!res.ok) {
      console.error('[certificate] upload failed:', await res.text())
      return null
    }
    return `${url}/storage/v1/object/public/${CERT_BUCKET}/${path}`
  } catch (err) {
    console.error('[certificate] upload error:', err)
    return null
  }
}

/** Looks up a training module's title using the service key. */
export async function getModuleTitle(moduleId: string): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const headers = serviceKeyHeaders()
  if (!url || !headers) return 'Training Module'
  try {
    const res = await fetch(`${url}/rest/v1/training_modules?id=eq.${encodeURIComponent(moduleId)}&select=title`, { headers })
    if (!res.ok) return 'Training Module'
    const rows = await res.json()
    return rows?.[0]?.title || 'Training Module'
  } catch {
    return 'Training Module'
  }
}
