import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'
import { computeQuote, type LineItem } from '@/lib/quote-pricing'

const SITE_URL = 'https://conveniencehubofmaryland.com'
const SUPPORT_PHONE = '202-579-2944'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, category, selections, honeypot } = body

    // Spam protection: honeypot field should always be empty for real users
    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const quote = computeQuote(category, selections || {})
    let total: number | null = quote.total
    const breakdown: LineItem[] = quote.breakdown

    // No sales tax is applied. The amount due is the full total (100%).
    if (total !== null) {
      total = Math.round(total * 100) / 100
    }

    const { error: dbError } = await dbInsertService('quote_requests', {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      category,
      selections: { ...selections, breakdown },
      estimated_subtotal: total,
      estimated_tax: 0,
      estimated_total: total,
      status: 'new',
    })

    if (dbError) {
      console.error('[quote] Database error:', JSON.stringify(dbError, null, 2))
      return NextResponse.json({ error: 'Failed to save', details: String(dbError) }, { status: 500 })
    }

    const apiKey = process.env.RESEND_API_KEY

    const priceBlock = total !== null
      ? `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%;margin-top:12px">
<tr><td style="padding:8px 16px 8px 0;color:#000;font-weight:700;border-top:2px solid #eee">Total Due</td><td style="padding:8px 0;font-weight:700;border-top:2px solid #eee;color:#E8192C">$${total.toFixed(2)}</td></tr>
</table>
<p style="font-size:12px;color:#999;margin-top:10px">Full payment of the total secures your appointment. Final details are confirmed after a brief assessment.</p>`
      : `<p style="font-size:14px;color:#333">Thanks for your interest! Since this service is customized, our team will review your details and follow up with a personalized quote shortly.</p>`

    const scheduleBlock = total !== null
      ? `<div style="background:#f8f6f2;padding:16px;margin-top:16px;font-size:13px;color:#333;line-height:1.6">
<p style="margin:0 0 8px 0"><strong>How scheduling works</strong></p>
<p style="margin:0 0 8px 0">Your service is offered within <strong>6 to 72 hours</strong> of confirmed payment.</p>
<p style="margin:0">Need service sooner? Call our customer service team at <strong>${SUPPORT_PHONE}</strong> to arrange an earlier time. We will confirm whether it is possible.</p>
</div>`
      : ''

    const bookNowBlock = total !== null
      ? `<div style="background:#f8f6f2;padding:20px;text-align:center;margin-top:20px">
<a href="${SITE_URL}/book" style="display:inline-block;background:#E8192C;color:#fff;padding:12px 28px;text-decoration:none;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px">View Your Quote →</a>
<p style="font-size:12px;color:#999;margin-top:10px">Click <strong>"Book Now with This Quote"</strong> to pay in full and secure your slot.</p>
</div>`
      : `<div style="background:#f8f6f2;padding:20px;text-align:center;margin-top:20px">
<a href="${SITE_URL}/book" style="display:inline-block;background:#E8192C;color:#fff;padding:12px 28px;text-decoration:none;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px">View Quote Request →</a>
<p style="font-size:12px;color:#999;margin-top:10px">Our team will send you a personalized quote shortly.</p>
</div>`

    if (apiKey) {
      try {
        // Notify admin
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'CHM Quotes <support@conveniencehubofmaryland.com>',
            to: ['conveniencehubofmaryland@gmail.com'],
            subject: `New Quote Request — ${name.trim()} (${category})`,
            html: `<h2 style="color:#E8192C">New Quote Request</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%">
<tr><td style="padding:6px 16px 6px 0;color:#666">Name</td><td style="padding:6px 0;font-weight:600">${name.trim()}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td style="padding:6px 0"><a href="tel:${phone.trim()}">${phone.trim()}</a></td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Category</td><td style="padding:6px 0">${category}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">Selections</td><td style="padding:6px 0"><pre style="white-space:pre-wrap;font-size:12px">${JSON.stringify(selections, null, 2)}</pre></td></tr>
</table>
${priceBlock}`,
          }),
        })

        // Confirmation to customer
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
            to: [email.trim()],
            subject: 'Your Quote from Convenience Hub of Maryland',
            html: `<h2 style="color:#E8192C">Thanks, ${name.trim()}!</h2>
<p style="font-size:14px;color:#333">Here's a summary of your request:</p>
${priceBlock}
${scheduleBlock}
${bookNowBlock}
<p style="font-size:13px;color:#666;margin-top:16px">Questions? Call or text us at ${SUPPORT_PHONE}.</p>`,
          }),
        })
      } catch (err) {
        console.error('[quote] email error:', err)
      }
    }

    const deposit = total !== null ? Math.round(total * 0.3 * 100) / 100 : null
    return NextResponse.json({ success: true, total, amountDue: total, deposit, breakdown })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[quote] error:', msg)
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 })
  }
}
