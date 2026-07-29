import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch offer letter with applicant data
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letters?id=eq.${id}&select=*,offer_letter_applicants(full_name,email,phone,position)`,
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

    const offerLetter = data[0]
    const applicant = offerLetter.offer_letter_applicants

    const signedDate = offerLetter.signed_at 
      ? new Date(offerLetter.signed_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Not signed'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Offer Letter</title>
          <style>
            body { font-family: Georgia, serif; margin: 40px; line-height: 1.8; }
            h1 { text-align: center; margin-bottom: 30px; }
            .header { text-align: center; margin-bottom: 40px; }
            .content { margin: 30px 0; }
            .signature-section { margin-top: 50px; }
            table { width: 100%; margin: 20px 0; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>OFFER OF EMPLOYMENT</h1>
            <p>Convenience Hub of Maryland, LLC</p>
          </div>

          <div class="content">
            <p>Dear ${applicant?.full_name || 'Applicant'},</p>
            <p>We are pleased to extend an offer of employment to you for the position of <strong>${offerLetter.position}</strong>.</p>

            <table>
              <tr>
                <td><strong>Position:</strong></td>
                <td>${offerLetter.position}</td>
              </tr>
              <tr>
                <td><strong>Annual Salary:</strong></td>
                <td>$${offerLetter.salary_annual?.toLocaleString() || 'TBD'}</td>
              </tr>
              <tr>
                <td><strong>Start Date:</strong></td>
                <td>${offerLetter.start_date || 'To be determined'}</td>
              </tr>
              <tr>
                <td><strong>Employee Name:</strong></td>
                <td>${applicant?.full_name || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>${applicant?.email || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Phone:</strong></td>
                <td>${applicant?.phone || 'N/A'}</td>
              </tr>
            </table>

            <h3>Benefits Summary</h3>
            <p>${offerLetter.benefits_summary || 'Benefits to be discussed with HR.'}</p>

            <p>This offer is contingent upon successful completion of our background check and other standard hiring procedures.</p>

            <p>Please contact us if you have any questions.</p>

            <p>Sincerely,<br/>Convenience Hub of Maryland<br/>202-579-2944</p>
          </div>

          <div class="signature-section">
            <p><strong>Accepted on:</strong> ${signedDate}</p>
            <p><strong>By:</strong> ${applicant?.full_name || 'N/A'}</p>
          </div>
        </body>
      </html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="OfferLetter-${applicant?.full_name || 'Employee'}-${signedDate.split(' ')[0]}.html"`,
      },
    })
  } catch (err) {
    console.error('[offer-download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
