import { NextRequest, NextResponse } from 'next/server'
import { dbInsert, dbSelect } from '@/lib/db'
import type { Service } from '@/lib/types'

export const runtime = 'edge'

async function notifyOwner(booking: {
  customer_name: string
  phone: string
  email: string | null
  service_title: string
  appointment_date: string
  time_slot: string
  notes: string | null
}) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CHM Bookings <onboarding@resend.dev>',
        to:   ['conveniencehubofmaryland@gmail.com'],
        subject: `New Booking — ${booking.service_title} on ${booking.appointment_date}`,
        html: `
          <h2 style="color:#E8192C">New Booking Request</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
            <tr><td style="padding:6px 16px 6px 0;color:#666">Customer</td><td style="font-weight:600">${booking.customer_name}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td><a href="tel:${booking.phone}">${booking.phone}</a></td></tr>
            ${booking.email ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td>${booking.email}</td></tr>` : ''}
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
  } catch {
    // Non-critical — booking was already saved
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    customer_name, phone, email,
    service_id, appointment_date, time_slot,
    notes, service_title,
  } = body

  if (!customer_name?.trim() || !phone?.trim() || !service_id || !appointment_date || !time_slot) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await dbInsert('appointments', {
    customer_name:    customer_name.trim(),
    phone:            phone.trim(),
    email:            email?.trim() || null,
    service_id,
    appointment_date,
    time_slot,
    notes:            notes?.trim() || null,
    status:           'pending',
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to save booking. Please call us at 202-579-2944.' }, { status: 500 })
  }

  // Fire-and-forget email notification
  const title = service_title?.trim() || service_id
  notifyOwner({
    customer_name: customer_name.trim(),
    phone:         phone.trim(),
    email:         email?.trim() || null,
    service_title: title,
    appointment_date,
    time_slot,
    notes: notes?.trim() || null,
  })

  return NextResponse.json({ success: true })
}
