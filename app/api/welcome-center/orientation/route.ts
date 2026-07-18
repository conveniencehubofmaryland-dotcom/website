import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'
import { sendUserEmail } from '@/lib/email'

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { applicant_id, full_name, email, signature } = body

  if (!applicant_id || !full_name || !email || !signature) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orientation_accepted: true,
          orientation_accepted_at: new Date().toISOString(),
          full_signature: signature,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!res.ok) {
      console.error('[orientation] Supabase error:', await res.text())
      return NextResponse.json({ error: 'Failed to save acknowledgment' }, { status: 500 })
    }

    // Send confirmation email with signed copy
    const confirmationHtml = `
      <p>Dear ${full_name},</p>
      <p>Thank you for completing the Convenience Hub of Maryland Orientation and Memorandum of Understanding.</p>
      <p>Your acknowledgment has been recorded on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
      <p>Next steps:</p>
      <ul>
        <li>Complete all required training modules: <a href="https://conveniencehubofmaryland.com/staff/training-modules">Training Modules</a></li>
        <li>Review your offer letter for position details and start date</li>
        <li>Prepare required documents for your first day</li>
        <li>Claim your first shift when assignments become available: <a href="https://conveniencehubofmaryland.com/staff/available-shifts">Claim Shifts</a></li>
      </ul>
      <p>If you have any questions, contact us at 202-579-2944 (Mon–Sat, 9 AM–9 PM).</p>
      <p>Welcome to the CHM team!</p>
      <p>Convenience Hub of Maryland<br>202-579-2944</p>
    `

    await sendUserEmail(
      email,
      'Orientation Acknowledgment Confirmed – Welcome to CHM',
      confirmationHtml
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[orientation] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
