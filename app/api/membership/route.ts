import { NextRequest, NextResponse } from 'next/server'

const VALID_STATES = ['MD', 'VA', 'DC']

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, state, services, frequency, recurring } = body

  if (!name?.trim() || !phone?.trim() || !email?.trim() || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!VALID_STATES.includes(state)) {
    return NextResponse.json({ error: 'We only serve Maryland, Virginia, and Washington D.C.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'CHM Memberships <onboarding@resend.dev>',
          to: ['conveniencehubofmaryland@gmail.com'],
          subject: `New Member Signup — ${name.trim()}`,
          html: `
            <h2 style="color:#E8192C">New Membership Application</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
              <tr><td style="padding:6px 16px 6px 0;color:#666">Name</td><td style="font-weight:600">${name.trim()}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td><a href="tel:${phone.trim()}">${phone.trim()}</a></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td>${email.trim()}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Location</td><td>${state}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Services</td><td>${Array.isArray(services) && services.length ? services.join(', ') : '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Frequency</td><td>${frequency || '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#666">Recurring</td><td>${recurring ? 'Yes' : 'No'}</td></tr>
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
