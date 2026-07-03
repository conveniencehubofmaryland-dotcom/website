import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { staff_name, staff_email, module_title, position, quiz_score, completed_at } = body

    if (!staff_email || !module_title || !position || !quiz_score) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
        <h1 style="color: #d32f2f; margin: 0;">CHM Training Certification</h1>
      </div>
      
      <div style="padding: 40px; background-color: #ffffff;">
        <p style="font-size: 16px; color: #333;">Dear ${staff_name},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Congratulations! You have successfully completed the training module and earned your certification.
        </p>
        
        <div style="background-color: #f0f0f0; padding: 20px; border-left: 4px solid #d32f2f; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Module:</strong> ${module_title}<br/>
            <strong>Position:</strong> ${position}<br/>
            <strong>Score:</strong> ${quiz_score}%<br/>
            <strong>Date Completed:</strong> ${new Date(completed_at).toLocaleDateString()}
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          You are now certified to work in this position for Convenience Hub of Maryland. Please keep this email for your records as proof of completion.
        </p>
        
        <p style="font-size: 16px; color: #333;">
          If you have any questions, please contact us at <strong>conveniencehubofmaryland@gmail.com</strong> or <strong>202-579-2944</strong>.
        </p>
        
        <p style="font-size: 16px; color: #333;">
          Best regards,<br/>
          <strong>Convenience Hub of Maryland Team</strong>
        </p>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        <p style="margin: 0;">Convenience Hub of Maryland | Service Area: MD, VA, DC</p>
      </div>
    </div>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'noreply@conveniencehubofmaryland.com',
        to: staff_email,
        subject: `🎉 Training Certification Complete - ${module_title}`,
        html: emailHtml,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, messageId: data.id })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
