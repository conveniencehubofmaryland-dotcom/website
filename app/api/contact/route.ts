import { NextRequest, NextResponse } from 'next/server'


export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, message } = body

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Name and message are required.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
  }

  const replyTo = email?.trim() || undefined

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:     'CHM Website <onboarding@resend.dev>',
        to:       ['conveniencehubofmaryland@gmail.com'],
        reply_to: replyTo,
        subject:  `New Enquiry from ${name.trim()}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <div style="background:#E8192C;padding:24px 32px">
              <h1 style="color:#fff;font-size:20px;margin:0">New Website Enquiry</h1>
            </div>
            <div style="padding:32px;background:#fff;border:1px solid #eee">
              <table style="border-collapse:collapse;font-size:14px;width:100%;margin-bottom:20px">
                <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#888;width:100px">Name</td><td style="color:#222;font-weight:600">${name.trim()}</td></tr>
                ${phone?.trim() ? `<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#888">Phone</td><td><a href="tel:${phone.trim()}" style="color:#E8192C">${phone.trim()}</a></td></tr>` : ''}
                ${replyTo ? `<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#888">Email</td><td><a href="mailto:${replyTo}" style="color:#E8192C">${replyTo}</a></td></tr>` : ''}
                <tr><td style="padding:10px 0;color:#888;vertical-align:top">Message</td><td style="color:#222;line-height:1.6">${message.trim().replace(/\n/g, '<br>')}</td></tr>
              </table>
              <p style="font-size:12px;color:#aaa">Sent from conveniencehubofmaryland.com</p>
            </div>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Failed to send message. Please call 202-579-2944.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please call 202-579-2944.' }, { status: 500 })
  }
}
