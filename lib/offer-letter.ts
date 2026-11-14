/* Offer letter for 1099 independent contractors (admin view/download).
 * Compensation follows the CHM Contractor Compensation Structure, effective October 22, 2026
 * (see lib/contractor-compensation.ts). */

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

const RESIDENTIAL_ROWS = [
  { tier: 'CHM BLUE', applies: 'Cleaning (one-time and monthly), Laundry Handling', you: '57%', chm: '43%' },
  { tier: 'CHM PRIORITY', applies: 'Cleaning (bi-weekly and weekly), Culinary', you: '59%', chm: '41%' },
  { tier: 'CHM XL', applies: 'Nanny / Childcare, Care Companion (Elderly), Regular Housekeeping', you: '61%', chm: '39%' },
  { tier: 'CHM ELITE', applies: 'Live-in Housekeeping, Multi-skilled Assignments', you: '67%', chm: '33%' },
]

const COMMERCIAL_ROWS = [
  { range: '$500 – $999 per month', chm: '20%' },
  { range: '$1,000 – $2,999 per month', chm: '25%' },
  { range: '$3,000 – $7,499 per month', chm: '30%' },
  { range: '$7,500 and above per month', chm: '35%' },
]

const COMMERCIAL_INCENTIVES = [
  'Zero complaints for the quarter: $100 – $250',
  'Upsell of additional services: 10% – 15% commission on the upsold amount',
  'Referral of a new commercial account: 5% of the fees from that account for 3 months',
  'One-year partnership milestone: $500 – $1,000 one-time payment',
]

export function buildOfferLetterHtml(opts: {
  documentId: string
  fullName: string
  email: string | null
  position: string
  startDate: string | null
  signedAt: string | null
}): string {
  const name = escapeHtml(opts.fullName || '')
  const position = escapeHtml(opts.position || '')
  const email = escapeHtml(opts.email || 'N/A')
  const start = escapeHtml(formatDate(opts.startDate))
  const signed = opts.signedAt ? escapeHtml(formatDate(opts.signedAt, true)) : 'Not signed'
  const docId = escapeHtml(opts.documentId)

  const residentialTable = RESIDENTIAL_ROWS.map(r => `
        <tr>
          <td>${escapeHtml(r.tier)}</td>
          <td>${escapeHtml(r.applies)}</td>
          <td>${r.you}</td>
          <td>${r.chm}</td>
        </tr>`).join('')

  const commercialTable = COMMERCIAL_ROWS.map(r => `
        <tr>
          <td>${escapeHtml(r.range)}</td>
          <td>${r.chm}</td>
        </tr>`).join('')

  const incentives = COMMERCIAL_INCENTIVES.map(i => `<li>${escapeHtml(i)}</li>`).join('')

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Independent Contractor Offer Letter</title>
    <style>
      body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; color: #1A1A1A; }
      h1 { text-align: center; margin-bottom: 4px; }
      h2 { font-size: 18px; margin-top: 28px; margin-bottom: 10px; }
      h3 { font-size: 15px; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; margin-bottom: 8px; }
      p { margin: 10px 0; }
      ul, ol { margin: 6px 0 6px 22px; }
      table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 14px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; vertical-align: top; }
      th { background: #f5f5f5; }
      .section { margin-bottom: 18px; border-bottom: 1px solid #ccc; padding-bottom: 14px; }
      .signature-section { margin-top: 36px; }
    </style>
  </head>
  <body>
    <h1>CONVENIENCE HUB OF MARYLAND</h1>
    <h2 style="text-align:center;">Independent Contractor Offer Letter</h2>

    <div class="section">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Service Role:</strong> ${position}</p>
      <p><strong>Start Date:</strong> ${start}</p>
    </div>

    <p>Dear ${name},</p>
    <p>We are pleased to offer you an independent contractor engagement with Convenience Hub of Maryland, LLC ("CHM") as a <strong>${position}</strong>, starting <strong>${start}</strong>.</p>

    <h3>1. Independent Contractor Status</h3>
    <ul>
      <li>You are an independent contractor, not an employee of CHM.</li>
      <li>You will be reported on IRS Form 1099. CHM does not withhold income tax from your payments, and you are responsible for your own taxes.</li>
      <li>You are not eligible for employee benefits, including hourly wages, paid time off, or retirement plan participation.</li>
    </ul>

    <h3>2. Compensation</h3>
    <p>You are paid under the CHM Contractor Compensation Structure, effective October 22, 2026.</p>

    <p><strong>Residential services.</strong> Each service fee is split between you and CHM by tier:</p>
    <table>
      <thead>
        <tr><th>Tier</th><th>Applies to</th><th>Your share</th><th>CHM share</th></tr>
      </thead>
      <tbody>${residentialTable}
      </tbody>
    </table>

    <p><strong>Commercial contracts.</strong> CHM's fee on a commercial contract depends on its monthly value. You receive the remaining amount of each monthly contract after CHM's fee:</p>
    <table>
      <thead>
        <tr><th>Monthly contract value</th><th>CHM fee</th></tr>
      </thead>
      <tbody>${commercialTable}
      </tbody>
    </table>
    <p>A contract exactly at a band threshold uses the higher band.</p>

    <p><strong>Commercial incentives</strong> (in addition to your contract share):</p>
    <ul>${incentives}</ul>

    <h3>3. Next Steps</h3>
    <ol>
      <li>Review and electronically sign this offer letter</li>
      <li>Complete IRS Form W-9 (Request for Taxpayer Identification Number)</li>
      <li>Complete all required training modules</li>
    </ol>

    <p>We are excited to have you join the team!</p>
    <p>Convenience Hub of Maryland<br>202-579-2944</p>

    <div class="signature-section">
      <h2>Acceptance</h2>
      <p>By signing below, you acknowledge receipt of this offer letter and agree to the terms and conditions outlined above, including your status as an independent contractor.</p>
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
