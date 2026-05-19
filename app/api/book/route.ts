import { NextRequest, NextResponse } from 'next/server'
import { dbInsert } from '@/lib/db'

async function whatsappNotify(message: string) {
  const apiKey  = process.env.CALLMEBOT_API_KEY
  const phone   = process.env.CALLMEBOT_PHONE
  const apiKey2 = process.env.CALLMEBOT_API_KEY_2
  const phone2  = process.env.CALLMEBOT_PHONE_2
  const encoded = encodeURIComponent(message)
  try {
    const sends = []
    const wa = (p: string, k: string) => fetch(`https://api.callmebot.com/whatsapp.php?phone=${p}&text=${encoded}&apikey=${k}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (apiKey && phone)   sends.push(wa(phone, apiKey))
    if (apiKey2 && phone2) sends.push(wa(phone2, apiKey2))
    await Promise.all(sends)
  } catch { /* non-critical */ }
}


async function confirmCustomer(booking: {
  customer_name: string
  email: string
  service_title: string
  appointment_date: string
  time_slot: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
        reply_to: ['conveniencehubofmaryland@gmail.com'],
        to:   [booking.email],
        subject: `Booking Received — ${booking.service_title}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
            <div style="background:#E8192C;padding:24px 32px">
              <h1 style="color:#fff;font-size:20px;margin:0">Booking Received</h1>
            </div>
            <div style="padding:32px;background:#fff;border:1px solid #eee">
              <p style="font-size:15px;color:#333">Hi ${booking.customer_name},</p>
              <p style="font-size:14px;color:#555">We received your booking and will confirm within 1 hour during business hours (Mon–Sat, 9 AM–9 PM).</p>
              <table style="border-collapse:collapse;font-size:14px;width:100%;margin:20px 0">
                <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#888;width:140px">Service</td><td style="color:#222;font-weight:600">${booking.service_title}</td></tr>
                <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:10px 0;color:#888">Date</td><td style="color:#222;font-weight:600">${booking.appointment_date}</td></tr>
                <tr><td style="padding:10px 0;color:#888">Time</td><td style="color:#222;font-weight:600">${booking.time_slot}</td></tr>
              </table>
              <p style="font-size:14px;color:#555">Questions? Call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.</p>
              <p style="font-size:12px;color:#aaa;margin-top:32px">Convenience Hub of Maryland &nbsp;·&nbsp; Maryland · Virginia · D.C.</p>
            </div>
          </div>
        `,
      }),
    })
    if (!res.ok) console.error('[book] confirmCustomer failed:', await res.text())
  } catch (e) {
    console.error('[book] confirmCustomer error:', e)
  }
}

async function notifyOwner(booking: {
  customer_name: string
  phone: string
  email: string | null
  state: string
  service_title: string
  appointment_date: string
  time_slot: string
  notes: string | null
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'CHM Bookings <support@conveniencehubofmaryland.com>',
        to:   ['conveniencehubofmaryland@gmail.com'],
        subject: `New Booking — ${booking.service_title} on ${booking.appointment_date}`,
        html: `
          <h2 style="color:#E8192C">New Booking Request</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
            <tr><td style="padding:6px 16px 6px 0;color:#666">Customer</td><td style="font-weight:600">${booking.customer_name}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td><a href="tel:${booking.phone}">${booking.phone}</a></td></tr>
            ${booking.email ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td>${booking.email}</td></tr>` : ''}
            <tr><td style="padding:6px 16px 6px 0;color:#666">Location</td><td>${booking.state}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666">Service</td><td>${booking.service_title}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666">Date</td><td>${booking.appointment_date}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666">Time</td><td>${booking.time_slot}</td></tr>
            ${booking.notes ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Notes</td><td>${booking.notes}</td></tr>` : ''}
          </table>
          <p style="margin-top:16px">
            <a href="https://www.conveniencehubofmaryland.com/admin/appointments"
               style="background:#E8192C;color:#fff;padding:10px 20px;text-decoration:none;font-weight:600;font-size:13px">
              View in Admin →
            </a>
          </p>
        `,
      }),
    })
    if (!res.ok) console.error('[book] notifyOwner failed:', await res.text())
  } catch (e) {
    console.error('[book] notifyOwner error:', e)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    customer_name, phone, email, state,
    service_id, appointment_date, time_slot,
    notes, service_title,
  } = body

  if (!customer_name?.trim() || !phone?.trim() || !state || !service_id || !appointment_date || !time_slot) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const VALID_STATES = ['MD', 'VA', 'DC']
  if (!VALID_STATES.includes(state)) {
    return NextResponse.json({ error: 'Sorry, we only serve Maryland, Virginia, and Washington D.C.' }, { status: 400 })
  }

  const { error } = await dbInsert('appointments', {
    customer_name:    customer_name.trim(),
    phone:            phone.trim(),
    email:            email?.trim() || null,
    state,
    service_id,
    appointment_date,
    time_slot,
    notes:            notes?.trim() || null,
    status:           'pending',
  })

  if (error) {
    console.error('[book] Supabase insert failed:', error)
    return NextResponse.json({ error: 'Failed to save booking. Please call us at 202-579-2944.' }, { status: 500 })
  }

  const title = service_title?.trim() || service_id
  const trimmedEmail = email?.trim() || null

  const stateLabel = state === 'MD' ? 'Maryland' : state === 'VA' ? 'Virginia' : state === 'DC' ? 'Washington D.C.' : state
  whatsappNotify(
    `NEW BOOKING\n` +
    `Service: ${title}\n` +
    `Date: ${appointment_date} at ${time_slot}\n` +
    `Location: ${stateLabel}\n` +
    `Customer: ${customer_name.trim()}\n` +
    `Phone: ${phone.trim()}\n` +
    (trimmedEmail ? `Email: ${trimmedEmail}\n` : '') +
    (notes?.trim() ? `Notes: ${notes.trim()}\n` : '') +
    `Admin: conveniencehubofmaryland.com/admin/appointments`
  )

  await Promise.all([
    notifyOwner({
      customer_name: customer_name.trim(),
      phone:         phone.trim(),
      email:         trimmedEmail,
      state,
      service_title: title,
      appointment_date,
      time_slot,
      notes: notes?.trim() || null,
    }),
    trimmedEmail ? confirmCustomer({
      customer_name:    customer_name.trim(),
      email:            trimmedEmail,
      service_title:    title,
      appointment_date,
      time_slot,
    }) : Promise.resolve(),
  ])

  return NextResponse.json({ success: true })
}
