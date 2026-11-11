import { NextRequest, NextResponse } from 'next/server'
import { svcInsert, sendEmail } from '@/lib/realtor'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const phone = String(body.phone || '').trim()
  const brokerage = String(body.brokerage || '').trim()
  if (!name || !email || !phone) {
    return NextResponse.json({ error: 'Please enter your name, email and phone.' }, { status: 400 })
  }
  const res = await svcInsert('realtors', { name, email, phone, brokerage: brokerage || null, approved: false })
  if (!res.ok) {
    if (res.error.includes('23505') || res.error.toLowerCase().includes('duplicate')) {
      return NextResponse.json({ error: 'This email is already registered. Use "Sign in" to get your code.' }, { status: 409 })
    }
    console.error('[realtor] register failed:', res.error)
    return NextResponse.json({ error: 'Could not register. Please call 202-579-2944.' }, { status: 500 })
  }
  await sendEmail({
    from: 'CHM Realtor Partners <support@conveniencehubofmaryland.com>',
    to: ['conveniencehubofmaryland@gmail.com'],
    subject: `New realtor partner request — ${name}`,
    html: `<p><strong>${name}</strong> (${brokerage || 'no brokerage given'}) asked to join as a realtor partner.</p><p>${email} · ${phone}</p><p>Approve them in admin → Realtors.</p>`,
  })
  return NextResponse.json({ ok: true })
}
