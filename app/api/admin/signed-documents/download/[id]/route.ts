import { requireAdmin } from '@/lib/admin-auth'
import { ORIENTATION_DOCUMENT } from '@/lib/orientation-document'
import { NextRequest, NextResponse } from 'next/server'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { id } = await params

    // Fetch applicant data (service key goes in apikey; Bearer only for legacy JWT-style keys)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const headers: Record<string, string> = { apikey: serviceKey }
    if (serviceKey.startsWith('eyJ')) headers.Authorization = `Bearer ${serviceKey}`
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${encodeURIComponent(id)}`,
      { headers }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const data = await res.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const applicant = data[0]

    const signedDate = new Date(applicant.orientation_accepted_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const name = escapeHtml(String(applicant.full_name ?? ''))
    const position = escapeHtml(String(applicant.position ?? ''))
    const email = escapeHtml(String(applicant.email || 'N/A'))
    const phone = escapeHtml(String(applicant.phone ?? ''))
    const address = escapeHtml(String(applicant.address || 'Not provided'))
    const signatureName = escapeHtml(String(applicant.signature_name || applicant.full_name || ''))
    const recordId = escapeHtml(String(applicant.id ?? ''))
    const signatureSrc = typeof applicant.full_signature === 'string'
      && (applicant.full_signature.startsWith('data:image/') || applicant.full_signature.startsWith('https://'))
      ? escapeHtml(applicant.full_signature)
      : null

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Orientation Document</title>
          <style>
            body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; color: #1A1A1A; }
            h1 { text-align: center; margin-bottom: 4px; }
            h2 { font-size: 18px; font-weight: bold; margin-top: 30px; margin-bottom: 12px; }
            p { margin: 5px 0; }
            .full-text { white-space: pre-wrap; word-wrap: break-word; font-size: 14px; border: 1px solid #ccc; padding: 24px; margin-top: 20px; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
            .signature-section { margin-top: 40px; }
            img { max-width: 300px; max-height: 120px; }
          </style>
        </head>
        <body>
          <h1>CONVENIENCE HUB OF MARYLAND</h1>

          <div class="section">
            <h2>EMPLOYEE INFORMATION</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Position:</strong> ${position}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Date Signed:</strong> ${signedDate}</p>
          </div>

          <h2>FULL ORIENTATION DOCUMENT &amp; MEMORANDUM OF UNDERSTANDING</h2>
          <div class="full-text">${escapeHtml(ORIENTATION_DOCUMENT)}</div>

          <div class="section" style="margin-top: 30px;">
            <h2>EMPLOYEE ACKNOWLEDGMENT</h2>
            <p>By signing this document, I acknowledge that I have read, understood, and agree to comply with all terms outlined in this Orientation Document and Memorandum of Understanding.</p>
            <p>I specifically acknowledge:</p>
            <ul>
              <li>I have received and reviewed the complete orientation document</li>
              <li>I understand the non-solicitation policy and $30,000 liquidated damages clause</li>
              <li>I understand the confidentiality requirements</li>
              <li>I understand the transportation requirements for shift scheduling</li>
              <li>I agree to comply with all CHM policies and procedures</li>
            </ul>
          </div>

          <div class="signature-section">
            <h2>EMPLOYEE SIGNATURE</h2>
            ${signatureSrc ? `<img src="${signatureSrc}" alt="Signature" style="margin-bottom: 20px;">` : '<p>No signature available</p>'}
            <p style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px;">
              <strong>Signature Name:</strong> ${signatureName}
            </p>
            <p><strong>Signed:</strong> ${signedDate}</p>
            <p><strong>By:</strong> ${name}</p>
            <p><strong>Position:</strong> ${position}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>This document was electronically signed and accepted on ${signedDate}</p>
            <p>Convenience Hub of Maryland • 202-579-2944</p>
            <p style="color: #999;">Record ID: ${recordId}</p>
          </div>
        </body>
      </html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Orientation-${String(applicant.full_name ?? 'Staff').replace(/[^A-Za-z0-9_-]/g, '_')}-${signedDate.split(' ')[0].replace(/[^A-Za-z0-9_-]/g, '_')}.html"`,
      },
    })
  } catch (err) {
    console.error('[download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
