import { NextRequest, NextResponse } from 'next/server'
import { dbInsert } from '@/lib/db'

const VALID_STATES = ['MD', 'VA', 'DC']

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, state, address, services, frequency, recurring } = body

  if (!name?.trim() || !phone?.trim() || !email?.trim() || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!VALID_STATES.includes(state)) {
    return NextResponse.json({ error: 'We only serve Maryland, Virginia, and Washington D.C.' }, { status: 400 })
  }

  const { error } = await dbInsert('members', {
    name:                name.trim(),
    phone:               phone.trim(),
    email:               email.trim(),
    state,
    address:             address?.trim() || null,
    preferred_services:  Array.isArray(services) && services.length ? services : null,
    service_frequency:   frequency || null,
    recurring:           !!recurring,
    active:              true,
  })

  if (error) {
    console.error('[membership] insert failed:', error)
    return NextResponse.json({ error: 'Failed to save membership. Please call us at 202-579-2944.' }, { status: 500 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const trimmedName  = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    await Promise.all([
      // Notify owner
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'CHM Memberships <support@conveniencehubofmaryland.com>',
          to: ['conveniencehubofmaryland@gmail.com'],
          subject: `New Member Signup — ${trimmedName}`,
          html: `
            <h2 style="color:#E8192C">New Membership Application</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
              <tr><td style="padding:6px 16px 6px 0;color:#666">Name</td><td style="font-weight:600">${trimmedName}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td><a href="tel:${trimmedPhone}">${trimmedPhone}</a></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td>${trimmedEmail}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Location</td><td>${state}</td></tr>
              ${address?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Address</td><td>${address.trim()}</td></tr>` : ''}
              <tr><td style="padding:6px 16px 6px 0;color:#666">Services</td><td>${Array.isArray(services) && services.length ? services.join(', ') : '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Frequency</td><td>${frequency || '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Recurring</td><td>${recurring ? 'Yes' : 'No'}</td></tr>
            </table>
          `,
        }),
      }).catch(() => {}),

      // Welcome email to member
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
          reply_to: ['conveniencehubofmaryland@gmail.com'],
          to: [trimmedEmail],
          subject: 'Welcome to Convenience Hub of Maryland — Membership Confirmed',
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
              <div style="background:#E8192C;padding:24px 32px">
                <h1 style="color:#fff;font-size:20px;margin:0">Membership Confirmed</h1>
              </div>
              <div style="padding:32px;background:#fff;border:1px solid #eee">
                <p style="font-size:15px;color:#333">Hi ${trimmedName},</p>
                <p style="font-size:14px;color:#555;line-height:1.6">
                  Welcome to Convenience Hub of Maryland. Your membership is now active and you have immediate access to all member benefits.
                </p>
                <table style="border-collapse:collapse;font-size:14px;width:100%;margin:20px 0">
                  <tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:10px 0;color:#888;width:160px">Priority Booking</td>
                    <td style="color:#222;font-weight:600">First access to available time slots</td>
                  </tr>
                  <tr style="border-bottom:1px solid #f0f0f0">
                    <td style="padding:10px 0;color:#888">Recurring Discount</td>
                    <td style="color:#222;font-weight:600">2% off all recurring services</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#888">Exclusive Deals</td>
                    <td style="color:#222;font-weight:600">Member-only weekly promotions</td>
                  </tr>
                </table>
                <p style="font-size:14px;color:#555">
                  Ready to book? Visit <a href="https://www.conveniencehubofmaryland.com/book" style="color:#E8192C">conveniencehubofmaryland.com/book</a> or call us at
                  <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.
                </p>
                <p style="font-size:12px;color:#aaa;margin-top:32px">Convenience Hub of Maryland &nbsp;·&nbsp; Maryland · Virginia · D.C.</p>
              </div>
            </div>
          `,
        }),
      }).catch(() => {}),
    ])
  }

  return NextResponse.json({ success: true })
}
