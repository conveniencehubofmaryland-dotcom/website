import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, documentUrl, documentName } = await req.json()

    if (!email || !documentUrl || !documentName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate a signed URL (if using Supabase Storage, you can get a signed URL)
    // For now, we'll send the document URL directly
    const publicDocumentUrl = documentUrl.startsWith('http')
      ? documentUrl
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-documents/${documentUrl}`

    await resend.emails.send({
      from: 'CHM Admin <admin@conveniencehubofmaryland.com>',
      to: email,
      subject: `Your ${documentName} is Ready`,
      html: `
        <h2>Document Available</h2>
        <p>Your ${documentName} has been shared with you by Convenience Hub of Maryland.</p>
        <p>
          <a href="${publicDocumentUrl}" style="display: inline-block; padding: 10px 20px; background-color: #c41e3a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Document
          </a>
        </p>
        <p>If you have any questions, please contact our team.</p>
        <p>Best regards,<br/>Convenience Hub of Maryland</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error sharing document:', err)
    return NextResponse.json(
      { error: 'Failed to share document' },
      { status: 500 }
    )
  }
}
