import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendUserEmail } from '@/lib/email'
import { sbFetch } from '@/lib/shift-eligibility'

// Applicants who have finished orientation may train.
const TRAINING_STATUSES = ['orientation_signed', 'orientation_completed', 'ready_to_claim_shifts']

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))
  const clean = String(email || '').trim()
  if (!clean || !clean.includes('@')) {
    return NextResponse.json({ error: 'Please enter the email you applied with.' }, { status: 400 })
  }

  try {
    const res = await sbFetch(
      `offer_letter_applicants?email=ilike.${encodeURIComponent(clean)}&select=id,full_name,onboarding_status`
    )
    const rows = res.ok ? await res.json() : []
    const applicant = Array.isArray(rows) && rows.length > 0 ? rows[0] : null

    // Same reply whether or not the email exists, so this cannot be used to look up applicants.
    if (!applicant || !TRAINING_STATUSES.includes(String(applicant.onboarding_status))) {
      return NextResponse.json({ success: true })
    }

    const code = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const update = await sbFetch(`offer_letter_applicants?id=eq.${applicant.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ login_code: code, login_code_expires_at: expiresAt, login_code_attempts: 0 }),
    })
    if (!update.ok) return NextResponse.json({ error: 'Could not send the code. Please try again.' }, { status: 500 })

    await sendUserEmail(
      clean,
      'Your Training Verification Code',
      `<p>Hi ${applicant.full_name},</p>
       <p>Your verification code for training is:</p>
       <p style="font-size: 24px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 20px 0;">${code}</p>
       <p>This code expires in 10 minutes. If you did not request it, please ignore this email.</p>
       <p>Convenience Hub of Maryland<br/>202-579-2944</p>`
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[training/send-code] Error:', err)
    return NextResponse.json({ error: 'Could not send the code. Please try again.' }, { status: 500 })
  }
}
