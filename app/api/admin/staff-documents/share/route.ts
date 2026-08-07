import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { email, documentUrl, documentName } = await req.json()

    if (!email || !documentUrl || !documentName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, documentUrl, documentName' },
        { status: 400 }
      )
    }

    // Build full document URL if it's just a path
    const fullUrl = documentUrl.startsWith('http')
      ? documentUrl
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-documents/${documentUrl}`

    // Send email with document link
    const res = await resend.emails.send({
      from: 'CHM Admin <admin@conveniencehubofmaryland.com>',
      to: email,
      subject: `Your ${documentName} from Convenience Hub of Maryland`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #c41e3a; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Document Available</h1>
          </div>

          <div style="padding: 30px;">
            <p>Hi,</p>
            
            <p>Your <strong>${documentName}</strong> has been shared with you by Convenience Hub of Maryland.</p>
            
            <p>Click the button below to view or download your document:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${fullUrl}" style="display: inline-block; padding: 12px 30px; background-color: #c41e3a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
                View ${documentName}
              </a>
            </div>

            <p style="color: #666; font-size: 13px; line-height: 1.6;">
              If you have any questions about this document or need assistance, please contact our team at:<br>
              📧 conveniencehubofmaryland@gmail.com<br>
              📱 202-579-2944
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              Convenience Hub of Maryland<br>
              This email was sent to you because your document is ready for review.
            </p>
          </div>
        </div>
      `,
    })

    if (res.error) {
      console.error('[staff-docs-share] Email send error:', res.error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    console.log('[staff-docs-share] Email sent to:', email)
    return NextResponse.json({ success: true, message: 'Document link sent via email' })
  } catch (err) {
    console.error('[staff-docs-share] Error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
