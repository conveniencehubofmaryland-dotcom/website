import { NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'

export async function POST(req: Request) {
  const body = await req.json()
  const { full_name, email, phone, position, address } = body

  if (!full_name?.trim() || !email?.trim() || !phone?.trim() || !position?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await dbInsertService('offer_letter_applicants', {
    full_name: full_name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    position: position.trim(),
    address: address?.trim() || null,
    status: 'draft',
  })

  if (error) {
    console.error('[welcome-center] Supabase insert failed:', error)
    return NextResponse.json({ error: 'Failed to save your information. Please try again or call us.' }, { status: 500 })
  }

  await Promise.all([
    sendUserEmail(
      email.trim(),
      'Welcome to Convenience Hub of Maryland',
      `Hi ${full_name.trim()}, thank you for your interest in joining our team as a ${position.trim()}. We've received your information and our team will be in touch shortly with next steps, including your offer letter.`
    ),
    sendAdminEmail(
      `New Welcome Center submission: ${full_name.trim()} - ${position.trim()}`,
      `Name: ${full_name.trim()}<br>Email: ${email.trim()}<br>Phone: ${phone.trim()}<br>Position: ${position.trim()}<br>Address: ${address?.trim() || '—'}`
    ),
  ])

  return NextResponse.json({ success: true })
}
