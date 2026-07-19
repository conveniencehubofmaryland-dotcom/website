import { NextRequest, NextResponse } from 'next/server'
import { dbSelectAuth, dbInsertService } from '@/lib/db'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { applicant_id, position, salary_annual, start_date, benefits_summary, manager_name, deadline_date, pay_frequency } = body

  if (!applicant_id || !position || !salary_annual || !start_date || !manager_name || !deadline_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const applicants = await dbSelectAuth<{ id: string; full_name: string; email: string; position: string }>('offer_letter_applicants', token, {
    select: 'id,full_name,email,position',
  })

  const applicant = applicants.find(a => a.id === applicant_id)
  if (!applicant) {
    return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const startDateFormatted = new Date(start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const deadlineDateFormatted = new Date(deadline_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  try {
    // Create offer letter record (no PDF - Cloudflare doesn't support fs)
    const { error: insertError } = await dbInsertService('offer_letters', {
      applicant_id,
      position,
      salary_annual,
      start_date,
      benefits_summary: benefits_summary || null,
      pdf_url: null,
    })

    if (insertError) {
      console.error('[offer-letters] Supabase insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to create offer letter' }, { status: 500 })
    }

    // Send offer letter email (HTML only)
    const offerLetterHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <h2 style="text-align: center; color: #1a1a1a;">CONVENIENCE HUB OF MARYLAND</h2>
        <h3 style="text-align: center; color: #666;">Offer of Employment</h3>
        
        <p style="margin-top: 30px;"><strong>Date:</strong> ${today}</p>
        
        <p>Dear ${applicant.full_name},</p>
        
        <p>We are pleased to offer you the position of <strong>${position}</strong> at Convenience Hub of Maryland, effective <strong>${startDateFormatted}</strong>.</p>
        
        <h4>POSITION DETAILS</h4>
        <ul>
          <li><strong>Position:</strong> ${position}</li>
          <li><strong>Reports To:</strong> ${manager_name}</li>
          <li><strong>Employment Type:</strong> Full-Time</li>
          <li><strong>Hours:</strong> 40 hours per week</li>
          <li><strong>Hourly Rate:</strong> $${salary_annual}/hour, paid weekly every Friday</li>
        </ul>
        
        <h4>COMPENSATION & BENEFITS</h4>
        <ul>
          <li><strong>Weekly Pay:</strong> Paid every Friday for work performed in the prior week</li>
          <li><strong>401(k) Retirement Plan:</strong> Eligible after 90 days of employment</li>
        </ul>
        
        <h4>TERMS OF EMPLOYMENT</h4>
        <ul>
          <li>This offer is contingent on successful completion of a background check and reference verification</li>
          <li>Employment is at-will and may be terminated by either party at any time</li>
          <li>You must complete all required company paperwork before your start date</li>
        </ul>
        
        <h4>NEXT STEPS</h4>
        <ol>
          <li>Review and sign this offer letter</li>
          <li>Return signed copy by <strong>${deadlineDateFormatted}</strong></li>
          <li>Complete background check authorization</li>
          <li>Bring government ID and proof of work authorization on Day 1</li>
          <li>Complete required training: <a href="https://conveniencehubofmaryland.com/staff/training-modules">Training Modules</a></li>
          <li>Claim your shifts: <a href="https://conveniencehubofmaryland.com/staff/available-shifts">Available Shifts</a></li>
        </ol>
        
        <p style="margin-top: 30px;">Please reply to this email or call us at <strong>202-579-2944</strong> (Mon–Sat, 9 AM–9 PM) to confirm your acceptance.</p>
        
        <p style="margin-top: 40px;"><strong>Sincerely,</strong></p>
        <p style="margin: 50px 0 0 0;">
          ${manager_name}<br>
          Convenience Hub of Maryland<br>
          202-579-2944
        </p>
      </div>
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
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[offer-letters] Error:', errorMessage)
    return NextResponse.json({ error: 'Failed to generate offer letter' }, { status: 500 })
  }
}
