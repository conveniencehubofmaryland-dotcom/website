import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch applicant data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${id}`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const data = await res.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const applicant = data[0]

    // Generate HTML content
    const signedDate = new Date(applicant.orientation_accepted_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Orientation Document</title>
          <style>
            body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; }
            h2 { font-weight: bold; margin-top: 30px; margin-bottom: 15px; }
            p { margin: 5px 0; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
            .signature-section { margin-top: 40px; }
            img { max-width: 300px; max-height: 120px; }
          </style>
        </head>
        <body>
          <h1>CONVENIENCE HUB OF MARYLAND</h1>
          <h2>New Employee Orientation Document & Memorandum of Understanding</h2>

          <div class="section">
            <h2>EMPLOYEE INFORMATION</h2>
            <p><strong>Name:</strong> ${applicant.full_name}</p>
            <p><strong>Position:</strong> ${applicant.position}</p>
            <p><strong>Email:</strong> <span style="color: #000; text-decoration: none;">${String(applicant.email || 'N/A').replace(/[\[\]]/g, '')}</span></p>
            <p><strong>Phone:</strong> ${applicant.phone}</p>
            <p><strong>Address:</strong> ${applicant.address || 'Not provided'}</p>
            <p><strong>Date Signed:</strong> ${signedDate}</p>
          </div>

          <div class="section">
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
            ${applicant.full_signature ? `<img src="${applicant.full_signature}" alt="Signature">` : '<p>No signature available</p>'}
            <p><strong>Signed:</strong> ${signedDate}</p>
            <p><strong>By:</strong> ${applicant.full_name}</p>
            <p><strong>Position:</strong> ${applicant.position}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>This document was electronically signed and accepted on ${signedDate}</p>
            <p>Convenience Hub of Maryland • 202-579-2944</p>
            <p style="color: #999;">Record ID: ${applicant.id}</p>
          </div>
        </body>
      </html>
    `

    // Return as HTML (browser will open/download it)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="Orientation-${applicant.full_name}-${signedDate.split(' ')[0]}.html"`,
      },
    })
  } catch (err) {
    console.error('[download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
