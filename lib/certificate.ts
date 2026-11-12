/* Builds and stores training certificates (saved once, when the quiz is passed). */

const CERT_BUCKET = 'application-documents'

function serviceKeyHeaders(): Record<string, string> | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!key) return null
  const h: Record<string, string> = { apikey: key }
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`
  return h
}

export function buildCertificateHtml(opts: {
  id: string
  staffName: string
  moduleTitle: string
  score: number
  completedAt: string
}): string {
  const completedDate = new Date(opts.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Training Certificate</title>
    <style>
      body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; text-align: center; }
      h1 { font-size: 28px; margin: 20px 0; }
      .certificate-box { border: 3px solid #8B0000; padding: 40px; margin: 40px 0; background-color: #fffaf0; }
      .certificate-header { font-size: 24px; font-weight: bold; color: #8B0000; margin-bottom: 30px; }
      .certificate-text { font-size: 16px; margin: 15px 0; }
      .staff-name { font-size: 20px; font-weight: bold; margin: 20px 0; }
      .module-name { font-size: 18px; margin: 20px 0; }
      .score { font-size: 14px; color: #666; margin: 10px 0; }
      .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; display: inline-block; width: 200px; }
      .footer { font-size: 12px; color: #666; margin-top: 40px; }
    </style>
  </head>
  <body>
    <h1>CONVENIENCE HUB OF MARYLAND</h1>
    <div class="certificate-box">
      <div class="certificate-header">Certificate of Completion</div>
      <p class="certificate-text">This is to certify that</p>
      <p class="staff-name">${opts.staffName}</p>
      <p class="certificate-text">has successfully completed the training module</p>
      <p class="module-name">${opts.moduleTitle}</p>
      <p class="score">Quiz Score: ${opts.score}%</p>
      <p class="certificate-text">On ${completedDate}</p>
      <p class="certificate-text">Signed and sealed by Convenience Hub of Maryland</p>
      <div style="margin-top: 40px;">
        <p style="font-size: 14px; color: #8B0000; font-weight: bold;">CONVENIENCE HUB OF MARYLAND</p>
        <div class="signature-line"></div>
        <p style="font-size: 12px; margin-top: 5px;">Official Stamp</p>
      </div>
    </div>
    <div class="footer">
      <p>Convenience Hub of Maryland • 202-579-2944</p>
      <p style="color: #999;">Certificate ID: ${opts.id}</p>
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
