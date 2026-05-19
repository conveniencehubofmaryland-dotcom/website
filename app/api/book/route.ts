import { NextRequest, NextResponse } from 'next/server'
import { dbInsert } from '@/lib/db'


function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  const chunks: string[] = []
  for (let i = 0; i < bytes.length; i += 1024) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 1024)))
  }
  return btoa(chunks.join(''))
}

function buildICS(params: {
  uid: string
  summary: string
  description: string
  date: string      // "2026-05-19"
  timeSlot: string  // "9:00 AM"
  organizerEmail: string
  attendeeEmail?: string
}): string {
  const [year, month, day] = params.date.split('-').map(Number)
  const timeMatch = params.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i)
  let hour = 0, minute = 0
  if (timeMatch) {
    hour = parseInt(timeMatch[1])
    minute = parseInt(timeMatch[2])
    const ampm = timeMatch[3].toUpperCase()
    if (ampm === 'PM' && hour !== 12) hour += 12
    if (ampm === 'AM' && hour === 12) hour = 0
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`
  const dtEnd   = `${year}${pad(month)}${pad(day)}T${pad(hour + 1)}${pad(minute)}00`
  const now     = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Convenience Hub of Maryland//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${params.uid}@conveniencehubofmaryland.com`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=America/New_York:${dtStart}`,
    `DTEND;TZID=America/New_York:${dtEnd}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description.replace(/\n/g, '\\n')}`,
    `ORGANIZER;CN=Convenience Hub of Maryland:mailto:${params.organizerEmail}`,
    ...(params.attendeeEmail ? [`ATTENDEE;CN=Guest;RSVP=TRUE:mailto:${params.attendeeEmail}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

async function confirmCustomer(booking: {
  uid: string
  customer_name: string
  email: string
  service_title: string
  appointment_date: string
  time_slot: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  const ics = buildICS({
    uid:            booking.uid,
    summary:        `${booking.service_title} — Convenience Hub of Maryland`,
    description:    `Hi ${booking.customer_name}, your booking for ${booking.service_title} on ${booking.appointment_date} at ${booking.time_slot} is received. We will confirm within 1 hour. Questions? Call 202-579-2944.`,
    date:           booking.appointment_date,
    timeSlot:       booking.time_slot,
    organizerEmail: 'conveniencehubofmaryland@gmail.com',
    attendeeEmail:  booking.email,
  })
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Convenience Hub of Maryland <onboarding@resend.dev>',
        to:   [booking.email],
        subject: `Booking Received — ${booking.service_title}`,
        attachments: [{ filename: 'appointment.ics', content: toBase64(ics) }],
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
              <p style="font-size:14px;color:#555">A calendar invite is attached — add it to your calendar to save the date.</p>
              <p style="font-size:14px;color:#555">Questions? Call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.</p>
              <p style="font-size:12px;color:#aaa;margin-top:32px">Convenience Hub of Maryland &nbsp;·&nbsp; Maryland · Virginia · D.C.</p>
            </div>
          </div>
        `,
      }),
    })
  } catch {
    // Non-critical
  }
}

async function notifyOwner(booking: {
  uid: string
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
  const ics = buildICS({
    uid:            booking.uid,
    summary:        `New Booking: ${booking.service_title} — ${booking.customer_name}`,
    description:    `Customer: ${booking.customer_name}\\nPhone: ${booking.phone}\\nLocation: ${booking.state}\\nService: ${booking.service_title}\\nDate: ${booking.appointment_date} at ${booking.time_slot}${booking.notes ? `\\nNotes: ${booking.notes}` : ''}`,
    date:           booking.appointment_date,
    timeSlot:       booking.time_slot,
    organizerEmail: 'conveniencehubofmaryland@gmail.com',
    attendeeEmail:  booking.email ?? undefined,
  })
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'CHM Bookings <onboarding@resend.dev>',
        to:   ['conveniencehubofmaryland@gmail.com'],
        subject: `New Booking — ${booking.service_title} on ${booking.appointment_date}`,
        attachments: [{ filename: 'appointment.ics', content: toBase64(ics) }],
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
          <p style="font-size:12px;color:#aaa;margin-top:8px">Calendar invite attached.</p>
        `,
      }),
    })
  } catch {
    // Non-critical — booking was already saved
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
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  notifyOwner({
    uid,
    customer_name: customer_name.trim(),
    phone:         phone.trim(),
    email:         trimmedEmail,
    state,
    service_title: title,
    appointment_date,
    time_slot,
    notes: notes?.trim() || null,
  })
  if (trimmedEmail) {
    confirmCustomer({
      uid,
      customer_name:    customer_name.trim(),
      email:            trimmedEmail,
      service_title:    title,
      appointment_date,
      time_slot,
    })
  }

  return NextResponse.json({ success: true })
}
