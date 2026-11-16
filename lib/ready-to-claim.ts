// Marks an applicant "Ready to Claim Shifts" and sends the congratulations email.
// Used by the Ready button and by the staff record editor, so both paths behave the same.
import crypto from 'crypto'
import { sendUserEmailHtml } from './email'
import { serviceHeaders } from './supabase-keys'
import { saveBadgeCopy } from './badge-copy'

export type ReadyResult = { ok: true } | { ok: false; status: number; error: string }

export async function markApplicantReady(applicantId: string): Promise<ReadyResult> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL

  const fetchRes = await fetch(
    `${base}/rest/v1/offer_letter_applicants?id=eq.${applicantId}&select=full_name,email,position`,
    { headers: { ...serviceHeaders() } }
  )
  const applicantData = fetchRes.ok ? await fetchRes.json() : []
  if (!Array.isArray(applicantData) || applicantData.length === 0) {
    return { ok: false, status: 404, error: 'Applicant not found' }
  }
  const applicant = applicantData[0]

  // The W-9 must be on file before the applicant can claim shifts.
  const w9Res = await fetch(`${base}/rest/v1/w9_forms?applicant_id=eq.${applicantId}&select=id&limit=1`, {
    headers: { ...serviceHeaders() },
  })
  const w9Rows = w9Res.ok ? await w9Res.json() : []
  if (!Array.isArray(w9Rows) || w9Rows.length === 0) {
    return { ok: false, status: 400, error: 'The applicant has not submitted their IRS Form W-9 yet.' }
  }

  // Claim token (valid 30 days) also unlocks the badge download link.
  const claimToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const updateRes = await fetch(`${base}/rest/v1/offer_letter_applicants?id=eq.${applicantId}`, {
    method: 'PATCH',
    headers: { ...serviceHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      onboarding_status: 'ready_to_claim_shifts',
      claim_shift_token: claimToken,
      claim_shift_token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }),
  })
  if (!updateRes.ok) {
    console.error('[ready] Update failed:', await updateRes.text())
    return { ok: false, status: 500, error: 'Failed to update applicant' }
  }

  // Keep a copy of the badge in admin Documents. A failure here must not block the applicant.
  try {
    await saveBadgeCopy(applicantId, applicant.full_name, applicant.position ?? null)
  } catch (err) {
    console.error('[ready] Badge copy failed:', err)
  }

  const claimLink = 'https://conveniencehubofmaryland.com/staff/claim-shifts-login'
  const badgeLink = `https://conveniencehubofmaryland.com/api/badge/${claimToken}`
  const firstName = String(applicant.full_name || '').split(' ')[0] || 'there'
  const emailHtml = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #c41e3a; padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0;">Congratulations, ${firstName}!</h1>
      </div>
      <div style="padding: 30px; color: #1a1a1a; line-height: 1.6;">
        <p>You have completed the entire Convenience Hub of Maryland onboarding process. Welcome to the team!</p>
        <p><strong>What you finished:</strong></p>
        <ul>
          <li>Reviewed How It Works and started your onboarding</li>
          <li>Submitted your welcome profile, background check, and IRS Form W-9</li>
          <li>Signed your offer letter and orientation</li>
          <li>Completed your required training modules</li>
        </ul>
        <p><strong>Your position:</strong> ${applicant.position || 'Staff'}</p>
        <p>You can now browse and claim shifts in the staff portal:</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${claimLink}" style="display: inline-block; background-color: #c41e3a; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 4px;">Claim Your Shifts</a>
        </p>
        <p><strong>Your CHM staff badge:</strong></p>
        <ol>
          <li>Tap the button below to open your badge.</li>
          <li>Press <strong>Print</strong> (Ctrl+P or Cmd+P) at 100% scale.</li>
          <li>Cut out the card along the red border and <strong>laminate</strong> it.</li>
        </ol>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${badgeLink}" style="display: inline-block; background-color: #c41e3a; color: #ffffff; padding: 14px 32px; text-decoration: none; font-weight: bold; border-radius: 4px;">Download &amp; Print My Badge</a>
        </p>
        <p><strong>Important:</strong> Present your badge to every client before you enter their home. Your badge link is valid for 30 days.</p>
        <p><strong>Remember:</strong></p>
        <ul>
          <li>You only work shifts you actively claim through the portal</li>
          <li>Shift confirmations will be sent by email</li>
          <li>Check the portal regularly for new opportunities</li>
        </ul>
        <p>Questions? Call or text 202-579-2944 (Mon–Sat 7 AM–11 PM, Sun 9 AM–9 PM).</p>
        <p><strong>The CHM Team</strong></p>
      </div>
    </div>`

  // The status is already saved, so an email failure is logged instead of shown as a failure.
  try {
    await sendUserEmailHtml(applicant.email, 'Congratulations – You Are Ready to Claim Shifts!', emailHtml)
  } catch (emailErr) {
    console.error('[ready] Congratulations email failed:', emailErr)
  }

  return { ok: true }
}
