import { NextRequest, NextResponse } from 'next/server'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { applicant_id, position, salary_annual, start_date, benefits_summary, manager_name, deadline_date, pay_frequency } = body

  if (!applicant_id || !position || !salary_annual || !start_date || !manager_name || !deadline_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const applicants = await dbSelectAuth<any>('offer_letter_applicants', token, {
    select: 'id,full_name,email,position',
  })

  const applicant = applicants.find(a => a.id === applicant_id)
  if (!applicant) {
    return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
  }

  const { error: insertError } = await dbInsertAuth('offer_letters', token, {
    applicant_id,
    position,
    salary_annual,
    start_date,
    benefits_summary: benefits_summary || null,
  })

  if (insertError) {
    console.error('[offer-letters] Supabase insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to create offer letter' }, { status: 500 })
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const startDateFormatted = new Date(start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const deadlineDateFormatted = new Date(deadline_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const offerLetterHtml = `
    <p><strong>Convenience Hub of Maryland Offer Letter</strong></p>
    <p>Date: ${today}</p>
    <p>Dear ${applicant.full_name},</p>
    <p>We are excited to offer you the position of <strong>${position}</strong> at Convenience Hub of Maryland. Your start date will be <strong>${startDateFormatted}</strong>.</p>
    <p><strong>Pay:</strong> $${salary_annual} per ${pay_frequency || 'year'}, paid ${pay_frequency === 'hour' ? 'weekly every Friday' : 'weekly'}.</p>
    <p><strong>Benefits include:</strong></p>
    <ul>
      <li>Weekly Pay – Get paid every week for your work performed in the prior work week.</li>
      <li>401(k) Plan – After 90 days of employment, you&apos;ll be eligible to join Convenience Hub of Maryland&apos;s 401(k) plan to save for your future.</li>
      ${benefits_summary ? `<li>${benefits_summary}</li>` : ''}
    </ul>
    <p>Additional details on benefits will be provided during onboarding.</p>
    <p><strong>Important Terms:</strong></p>
    <ul>
      <li>This offer is contingent on completing a background check and company paperwork.</li>
      <li>Employment with Convenience Hub of Maryland is at-will.</li>
    </ul>
    <p><strong>To accept, please sign and return this letter by ${deadlineDateFormatted}.</strong></p>
    <p>Welcome to the Convenience Hub of Maryland team!</p>
    <p>Sincerely,<br>${manager_name}<br>Convenience Hub of Maryland<br>202-579-2944</p>
  `

  await sendUserEmail(
    applicant.email,
    'Your Offer Letter from Convenience Hub of Maryland',
    offerLetterHtml
  )

  await sendAdminEmail(
    `Offer letter sent: ${applicant.full_name}`,
    `Position: ${position}<br>Salary: $${salary_annual}/${pay_frequency || 'year'}<br>Start Date: ${startDateFormatted}<br>Sent to: ${applicant.email}`
  )

  return NextResponse.json({ success: true })
}
