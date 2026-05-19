import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbPatchAuth, dbSelectAuth } from '@/lib/db'
import type { Appointment } from '@/lib/types'

const VALID_STATUSES = ['pending', 'confirmed', 'cancelled']

async function sendConfirmationEmail(appt: Appointment) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !appt.email) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
        reply_to: ['conveniencehubofmaryland@gmail.com'],
        to: [appt.email],
        subject: `Booking Confirmed — ${appt.service_id ?? 'Your Service'}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <div style="background:#E8192C;padding:24px 32px">
              <h1 style="color:#fff;font-size:20px;margin:0">Booking Confirmed</h1>
            </div>
            <div style="padding:32px;background:#fff;border:1px solid #eee">
              <p style="font-size:15px;color:#333">Hi ${appt.customer_name},</p>
              <p style="font-size:14px;color:#555">Your appointment has been confirmed. We look forward to seeing you!</p>
              <table style="border-collapse:collapse;font-size:14px;width:100%;margin:20px 0">
                <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#888;width:140px">Service</td><td style="color:#222;font-weight:600">${appt.service_id ?? 'N/A'}</td></tr>
                <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#888">Date</td><td style="color:#222;font-weight:600">${appt.appointment_date}</td></tr>
                <tr><td style="padding:10px 0;color:#888">Time</td><td style="color:#222;font-weight:600">${appt.time_slot}</td></tr>
              </table>
              <p style="font-size:14px;color:#555">Questions? Call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.</p>
              <p style="font-size:12px;color:#aaa;margin-top:32px">Convenience Hub of Maryland &nbsp;·&nbsp; Maryland · Virginia · D.C.</p>
            </div>
          </div>
        `,
      }),
    })
    if (!res.ok) console.error('[confirm] email failed:', await res.text())
  } catch (e) {
    console.error('[confirm] email error:', e)
  }
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json()
  if (!id || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { error } = await dbPatchAuth('appointments', id, { status }, token)
  if (error) return NextResponse.json({ error }, { status: 500 })

  if (status === 'confirmed') {
    const rows = await dbSelectAuth<Appointment>('appointments', token, { 'id': `eq.${id}`, select: '*' })
    if (rows[0]?.email) {
      sendConfirmationEmail(rows[0])
    }
  }

  return NextResponse.json({ success: true })
}
