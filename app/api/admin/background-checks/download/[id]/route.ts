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
      .from('offer_letter_applicants')
      .select('id, full_name, email, position, background_check_url, background_check_status')
      .eq('id', id)
      .single()

    if (error || !data || !data.background_check_url) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const uploadedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const statusDisplay = data.background_check_status ? data.background_check_status.charAt(0).toUpperCase() + data.background_check_status.slice(1) : 'Uploaded'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Background Check Document</title>
          <style>
            body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; }
            h1 { text-align: center; margin-bottom: 10px; }
            h2 { font-weight: bold; margin-top: 30px; margin-bottom: 15px; }
            p { margin: 10px 0; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
            .status-box { 
              background-color: #e8f4f8; 
              border-left: 4px solid #0066cc; 
              padding: 15px; 
              margin: 20px 0; 
            }
            .status-label { font-weight: bold; color: #0066cc; }
          </style>
        </head>
        <body>
          <h1>CONVENIENCE HUB OF MARYLAND</h1>
          <h2>Background Check Document Record</h2>
          
          <div class="section">
            <h2>APPLICANT INFORMATION</h2>
            <p><strong>Name:</strong> ${data.full_name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Position:</strong> ${data.position}</p>
          </div>

          <div class="section">
            <h2>BACKGROUND CHECK STATUS</h2>
            <div class="status-box">
              <p><span class="status-label">Status:</span> ${statusDisplay}</p>
              <p><span class="status-label">Document Type:</span> Background Check</p>
              <p><span class="status-label">Uploaded On:</span> ${uploadedDate}</p>
            </div>
          </div>

          <div class="section">
            <h2>DOCUMENT INFORMATION</h2>
            <p><strong>Document Link:</strong> <a href="${data.background_check_url}" target="_blank">View Document</a></p>
            <p><strong>Document URL:</strong> ${data.background_check_url}</p>
          </div>

          <div class="section">
            <h2>NOTES</h2>
            <p>This document certifies that ${data.full_name} has submitted a background check as part of the Convenience Hub of Maryland onboarding process. The background check status is listed above.</p>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>This record was generated on ${uploadedDate}</p>
            <p>Convenience Hub of Maryland • 202-579-2944</p>
            <p style="color: #999;">Record ID: ${data.id}</p>
          </div>
        </body>
      </html>
    `

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="BackgroundCheck-${data.full_name}.html"`,
      },
    })
  } catch (err) {
    console.error('[background-checks download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
