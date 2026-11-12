/* Full offer letter document (admin view/download). The wording follows the offer email sent in
 * app/api/admin/offer-letters/route.ts. */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return 'Not provided'
  const d = new Date(value)
  if (isNaN(d.getTime())) return 'Not provided'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export function buildOfferLetterHtml(opts: {
  documentId: string
  fullName: string
  email: string | null
  position: string
  startDate: string | null
  hourlyRate: number | null
  benefitsSummary: string | null
  signedAt: string | null
}): string {
  const name = escapeHtml(opts.fullName || '')
  const position = escapeHtml(opts.position || '')
  const email = escapeHtml(opts.email || 'N/A')
  const start = escapeHtml(formatDate(opts.startDate))
  const rate = opts.hourlyRate != null ? escapeHtml(`$${opts.hourlyRate}`) : 'Not provided'
  const benefits = opts.benefitsSummary ? escapeHtml(opts.benefitsSummary).replace(/\n/g, '<br>') : ''
  const signed = opts.signedAt ? escapeHtml(formatDate(opts.signedAt, true)) : 'Not signed'
  const docId = escapeHtml(opts.documentId)

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Offer Letter</title>
    <style>
      body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; color: #1A1A1A; }
      h1 { text-align: center; margin-bottom: 4px; }
      h2 { font-size: 18px; margin-top: 28px; margin-bottom: 10px; }
      h3 { font-size: 15px; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; margin-bottom: 8px; }
      p { margin: 10px 0; }
      ul, ol { margin: 6px 0 6px 22px; }
      .section { margin-bottom: 18px; border-bottom: 1px solid #ccc; padding-bottom: 14px; }
      .signature-section { margin-top: 36px; }
    </style>
  </head>
  <body>
    <h1>CONVENIENCE HUB OF MARYLAND</h1>
    <h2 style="text-align:center;">Offer Letter</h2>

    <div class="section">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Position:</strong> ${position}</p>
      <p><strong>Start Date:</strong> ${start}</p>
    </div>

    <p>Dear ${name},</p>
    <p>We are pleased to offer you the position of <strong>${position}</strong> at Convenience Hub of Maryland, effective <strong>${start}</strong>.</p>

    <h3>Position Details</h3>
    <ul>
      <li><strong>Position:</strong> ${position}</li>
      <li><strong>Start Date:</strong> ${start}</li>
      <li><strong>Employment Type:</strong> Full-Time</li>
      <li><strong>Hours:</strong> 40 hours per week</li>
      <li><strong>Hourly Rate:</strong> ${rate}/hour, paid weekly every Friday</li>
    </ul>

    <h3>Compensation &amp; Benefits</h3>
    <ul>
      <li><strong>Weekly Pay:</strong> Paid every Friday for work performed in the prior week</li>
      <li><strong>401(k) Retirement Plan:</strong> Eligible after 90 days of employment</li>
      ${benefits ? `<li><strong>Benefits Summary:</strong><br>${benefits}</li>` : ''}
    </ul>

    <h3>Next Steps</h3>
    <ol>
      <li>Review and electronically sign this offer letter</li>
      <li>Complete all required training modules</li>
      <li>Bring government ID and proof of work authorization on Day 1</li>
    </ol>

    <p>We are excited to have you join the team!</p>
    <p>Convenience Hub of Maryland<br>202-579-2944</p>

    <div class="signature-section">
      <h2>Acceptance</h2>
      <p>By signing below, you acknowledge receipt of this offer letter and agree to the terms and conditions outlined above.</p>
      <p style="margin-top: 36px; border-top: 1px solid #ccc; padding-top: 10px;"><strong>Signed:</strong> ${signed}</p>
      <p><strong>By:</strong> ${name}</p>
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
      <p>Convenience Hub of Maryland • 202-579-2944</p>
      <p style="color: #999;">Document ID: ${docId}</p>
    </div>
  </body>
</html>`
}
