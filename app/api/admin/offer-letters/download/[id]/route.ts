import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('offer_letters')
      .select('*, offer_letter_applicants(full_name, email, position)')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const applicant = data.offer_letter_applicants
    const signedDate = data.signed_at
      ? new Date(data.signed_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Not signed'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Offer Letter</title>
          <style>
            body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; }
            h1 { text-align: center; margin-bottom: 10px; }
            h2 { font-weight: bold; margin-top: 30px; margin-bottom: 15px; }
            p { margin: 10px 0; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
            .signature-section { margin-top: 40px; }
            .highlight { background-color: #fffacd; padding: 15px; border-left: 4px solid #ffd700; }
          </style>
        </head>
        <body>
          <h1>CONVENIENCE HUB OF MARYLAND</h1>
          <h2>Offer Letter</h2>
          
          <div class="section">
            <h2>EMPLOYEE INFORMATION</h2>
            <p><strong>Name:</strong> ${applicant.full_name}</p>
            <p><strong>Position:</strong> ${applicant.position}</p>
            <p><strong>Email:</strong> ${applicant.email}</p>
            <p><strong>Start Date:</strong> ${data.start_date ? new Date(data.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}</p>
          </div>

          <div class="section">
            <h2>COMPENSATION & BENEFITS</h2>
            <p><strong>Annual Salary:</strong> $${data.salary_annual?.toLocaleString()}</p>
            ${data.benefits_summary ? `<p><strong>Benefits Summary:</strong></p><p>${data.benefits_summary.replace(/\n/g, '<br>')}</p>` : ''}
          </div>

          <div class="section">
            <h2>NEXT STEPS</h2>
            <ul>
              <li>Complete background check</li>
              <li>Complete training modules</li>
              <li>Review and sign orientation document</li>
              <li>Claim your first available shifts</li>
            </ul>
          </div>

          <div class="signature-section">
            <h2>ACCEPTANCE</h2>
            <p>By signing below, you acknowledge receipt of this offer letter and agree to the terms and conditions outlined above.</p>
            <p style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px;">
              <strong>Signed:</strong> ${signedDate}
            </p>
            <p><strong>By:</strong> ${applicant.full_name}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>Convenience Hub of Maryland • 202-579-2944</p>
            <p style="color: #999;">Document ID: ${data.id}</p>
          </div>
        </body>
      </html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="OfferLetter-${applicant.full_name}.html"`,
      },
    })
  } catch (err) {
    console.error('[offer-letters download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
