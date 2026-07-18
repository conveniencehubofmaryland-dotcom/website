import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { full_name, email, phone, position, address } = body

  if (!full_name || !email || !phone || !position) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    // Insert applicant and get the response with ID
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants`,
      {
        method: 'POST',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          full_name,
          email,
          phone,
          position,
          address: address || null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!res.ok) {
      const error = await res.text()
      console.error('[welcome-center] Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create applicant record' }, { status: 500 })
    }

    const insertedRows = await res.json()
    const applicant_id = insertedRows[0]?.id

    if (!applicant_id) {
      console.error('[welcome-center] No ID returned from insert')
      return NextResponse.json({ error: 'Failed to create applicant record' }, { status: 500 })
    }

    // Send emails
    const applicantEmailHtml = `
      <p>Dear ${full_name},</p>
      <p>Thank you for your interest in joining Convenience Hub of Maryland!</p>
      <p>Your application has been received. We're excited to move forward with you.</p>
      <p><strong>Next Step:</strong> You will receive an offer letter with position details and compensation information within 24-48 business hours.</p>
      <p>In the meantime, please review our orientation document and familiarize yourself with our company values and policies.</p>
      <p>If you have any questions, contact us at 202-579-2944 (Mon–Sat, 9 AM–9 PM).</p>
      <p>Best regards,<br>Convenience Hub of Maryland</p>
    `

    const adminEmailHtml = `
      <p>New application received:</p>
      <ul>
        <li><strong>Name:</strong> ${full_name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
        <li><strong>Position:</strong> ${position}</li>
        <li><strong>Address:</strong> ${address || 'Not provided'}</li>
      </ul>
      <p><a href="https://conveniencehubofmaryland.com/admin/offer-letters">View in Admin Dashboard</a></p>
    `

    await sendUserEmail(email, 'Your Application to CHM – Welcome!', applicantEmailHtml)
    await sendAdminEmail('New Application Received', adminEmailHtml)

    console.log('[welcome-center] Applicant created:', applicant_id)

    return NextResponse.json({ success: true, id: applicant_id })
  } catch (err) {
    console.error('[welcome-center] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error. Please call us at 202-579-2944.' }, { status: 500 })
  }
}
