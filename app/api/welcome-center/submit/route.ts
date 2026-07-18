import { NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { full_name, email, phone, position, address } = body

    if (!full_name?.trim() || !email?.trim() || !phone?.trim() || !position?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[welcome-center] Attempting to insert:', { full_name, email, phone, position, address })

    const { error } = await dbInsertService('offer_letter_applicants', {
      full_name: full_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      position: position.trim(),
      address: address?.trim() || null,
      status: 'draft',
    })

    if (error) {
      console.error('[welcome-center] dbInsertService error:', error)
      return NextResponse.json({ error: `Database error: ${error}` }, { status: 500 })
    }

    console.log('[welcome-center] Insert successful, sending emails')

    await Promise.all([
      sendUserEmail(
        email.trim(),
        'Welcome to Convenience Hub of Maryland',
        `Hi ${full_name.trim()}, thank you for your interest in joining our team as a ${position.trim()}. We&apos;ve received your information and our team will be in touch shortly with next steps, including your offer letter.`
      ),
      sendAdminEmail(
      `New Welcome Center submission: ${full_name.trim()} - ${position.trim()}`,
      `Name: ${full_name.trim()}<br>Email: ${email.trim()}<br>Phone: ${phone.trim()}<br>Position: ${position.trim()}<br>Address: ${address?.trim() || '—'}<br><br><a href="https://conveniencehubofmaryland.com/admin/offer-letters">View in Admin Dashboard</a>`
    ),
    ])

    console.log('[welcome-center] Emails sent successfully')
    return NextResponse.json({ success: true, id: applicant_id })
  } catch (err) {
    console.error('[welcome-center] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error. Please call us at 202-579-2944.' }, { status: 500 })
  }
}
