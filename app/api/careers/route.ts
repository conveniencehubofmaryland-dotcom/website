import { NextRequest, NextResponse } from 'next/server'
import { dbInsert } from '@/lib/db'

const VALID_STATES = ['MD', 'VA', 'DC']

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, address, city, state, gender, positions, days, hours, experience } = body

  if (!name?.trim() || !phone?.trim() || !email?.trim() || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!VALID_STATES.includes(state)) {
    return NextResponse.json({ error: 'We only hire in Maryland, Virginia, and Washington D.C.' }, { status: 400 })
  }

  const { error: dbError } = await dbInsert('job_applications', {
    name:       name.trim(),
    phone:      phone.trim(),
    email:      email.trim(),
    address:    address?.trim() || null,
    city:       city?.trim() || null,
    state,
    gender:     gender?.trim() || null,
    positions:  Array.isArray(positions) ? positions : [],
    days:       Array.isArray(days) ? days : [],
    hours:      hours?.trim() || null,
    experience: experience?.trim() || null,
    status:     'new',
  })

  if (dbError) console.error('[careers] db error:', dbError)

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'CHM Careers <support@conveniencehubofmaryland.com>',
          to: ['conveniencehubofmaryland@gmail.com'],
          subject: `New Job Application — ${name.trim()}`,
          html: `
            <h2 style="color:#E8192C">New Job Application</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
              <tr><td style="padding:6px 16px 6px 0;color:#666">Name</td><td style="font-weight:600">${name.trim()}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td><a href="tel:${phone.trim()}">${phone.trim()}</a></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td>${email.trim()}</td></tr>
              ${address?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Address</td><td>${address.trim()}</td></tr>` : ''}
              ${city?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666">City</td><td>${city.trim()}</td></tr>` : ''}
              <tr><td style="padding:6px 16px 6px 0;color:#666">State</td><td>${state}</td></tr>
              ${gender?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Gender</td><td>${gender.trim()}</td></tr>` : ''}
              <tr><td style="padding:6px 16px 6px 0;color:#666">Positions</td><td>${Array.isArray(positions) && positions.length ? positions.join(', ') : '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Available Days</td><td>${Array.isArray(days) && days.length ? days.join(', ') : '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Available Hours</td><td>${hours || '—'}</td></tr>
              ${experience?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">Experience</td><td>${experience.trim()}</td></tr>` : ''}
            </table>
          `,
        }),
      })
    } catch {
      // Non-critical
    }
  }

  return NextResponse.json({ success: true })
}
