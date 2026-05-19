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
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'CHM Memberships <support@conveniencehubofmaryland.com>',
          to: ['conveniencehubofmaryland@gmail.com'],
          subject: `New Member Signup — ${name.trim()}`,
          html: `
            <h2 style="color:#E8192C">New Membership Application</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
              <tr><td style="padding:6px 16px 6px 0;color:#666">Name</td><td style="font-weight:600">${name.trim()}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td><a href="tel:${phone.trim()}">${phone.trim()}</a></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td>${email.trim()}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Location</td><td>${state}</td></tr>
              ${address?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Address</td><td>${address.trim()}</td></tr>` : ''}
              <tr><td style="padding:6px 16px 6px 0;color:#666">Services</td><td>${Array.isArray(services) && services.length ? services.join(', ') : '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Frequency</td><td>${frequency || '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Recurring</td><td>${recurring ? 'Yes' : 'No'}</td></tr>
            </table>
          `,
        }),
      })
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ success: true })
}
