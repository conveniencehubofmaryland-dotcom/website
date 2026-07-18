/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { dbSelectAuth, dbInsertService } from '@/lib/db'
import { sendUserEmail, sendAdminEmail } from '@/lib/email'
import PDFDocument from 'pdfkit'

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
    // Generate PDF
    const pdfBuffer = await generateOfferPDF({
      applicantName: applicant.full_name,
      position,
      startDate: startDateFormatted,
      managerName: manager_name,
      salaryAnnual: salary_annual,
      deadlineDate: deadlineDateFormatted,
      benefitsSummary: benefits_summary,
      payFrequency: pay_frequency || 'year',
    })

    // Upload to Supabase Storage
    const pdfFileName = `${applicant_id}-${Date.now()}.pdf`
    const uploadRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/offer-letters/${pdfFileName}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/pdf',
        },
        body: pdfBuffer,
      }
    )

    let pdfUrl: string | null = null
    if (uploadRes.ok) {
      pdfUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/offer-letters/${pdfFileName}`
    }

    // Create offer letter record
    const { error: insertError } = await dbInsertService('offer_letters', {
      applicant_id,
      position,
      salary_annual,
      start_date,
      benefits_summary: benefits_summary || null,
      pdf_url: pdfUrl,
    })

    if (insertError) {
      console.error('[offer-letters] Supabase insert failed:', insertError)
      return NextResponse.json({ error: 'Failed to create offer letter' }, { status: 500 })
    }

    // Send emails
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
          <li><strong>Hours:</strong> 40 hours per week (schedule to be discussed)</li>
          <li><strong>Hourly Rate:</strong> $${salary_annual}/hour, paid weekly every Friday</li>
        </ul>
        
        <h4>COMPENSATION &amp; BENEFITS</h4>
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
        ${pdfUrl ? `<p style="margin-top: 30px; text-align: center;"><a href="${pdfUrl}" style="color: #d73a3a; text-decoration: none; font-weight: bold;">Download Offer Letter PDF</a></p>` : ''}
      </div>
    `

    await sendUserEmail(
      applicant.email,
      'Your Offer Letter from Convenience Hub of Maryland',
      offerLetterHtml
    )

    await sendAdminEmail(
      `Offer letter sent: ${applicant.full_name}`,
      `Position: ${position}<br>Salary: $${salary_annual}/${pay_frequency || 'year'}<br>Start Date: ${startDateFormatted}<br>Sent to: ${applicant.email}${pdfUrl ? `<br><a href="${pdfUrl}">View PDF</a>` : ''}`
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[offer-letters] Error:', err)
    return NextResponse.json({ error: 'Failed to generate offer letter' }, { status: 500 })
  }
}

async function generateOfferPDF(data: {
  applicantName: string
  position: string
  startDate: string
  managerName: string
  salaryAnnual: number
  deadlineDate: string
  benefitsSummary: string | null
  payFrequency: string
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument()
    const chunks: Buffer[] = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text('CONVENIENCE HUB OF MARYLAND', { align: 'center' })
    doc.fontSize(12).font('Helvetica').text('Offer of Employment', { align: 'center' })
    doc.moveDown()

    // Date
    doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
    doc.moveDown()

    // Greeting
    doc.fontSize(11).text(`Dear ${data.applicantName},`)
    doc.moveDown()

    // Body
    doc.fontSize(11).text(`We are pleased to offer you the position of ${data.position} at Convenience Hub of Maryland, effective ${data.startDate}.`)
    doc.moveDown()

    // Position Details
    doc.fontSize(11).font('Helvetica-Bold').text('POSITION DETAILS')
    doc.font('Helvetica').fontSize(10)
    doc.text(`Position: ${data.position}`)
    doc.text(`Reports To: ${data.managerName}`)
    doc.text('Employment Type: Full-Time')
    doc.text('Hours: 40 hours per week (schedule to be discussed)')
    doc.text(`Hourly Rate: $${data.salaryAnnual}/hour, paid weekly every Friday`)
    doc.moveDown()

    // Compensation & Benefits
    doc.fontSize(11).font('Helvetica-Bold').text('COMPENSATION & BENEFITS')
    doc.font('Helvetica').fontSize(10)
    doc.text('Weekly Pay: Paid every Friday for work performed in the prior week')
    doc.text('401(k) Retirement Plan: Eligible after 90 days of employment')
    doc.moveDown()

    // Terms
    doc.fontSize(11).font('Helvetica-Bold').text('TERMS OF EMPLOYMENT')
    doc.font('Helvetica').fontSize(10)
    doc.text('This offer is contingent on successful completion of a background check and reference verification')
    doc.text('Employment is at-will and may be terminated by either party at any time')
    doc.text('You must complete all required company paperwork before your start date')
    doc.moveDown()

    // Next Steps
    doc.fontSize(11).font('Helvetica-Bold').text('NEXT STEPS')
    doc.font('Helvetica').fontSize(10)
    doc.text(`1. Review and sign this offer letter`)
    doc.text(`2. Return signed copy by ${data.deadlineDate}`)
    doc.text(`3. Complete background check authorization`)
    doc.text(`4. Bring government ID and proof of work authorization on Day 1`)
    doc.text(`5. Complete required training`)
    doc.text(`6. Claim your shifts`)
    doc.moveDown()

    // Closing
    doc.fontSize(10).text('Please reply to this email or call us at 202-579-2944 (Mon–Sat, 9 AM–9 PM) to confirm your acceptance.')
    doc.moveDown(2)

    doc.fontSize(11).font('Helvetica-Bold').text('Sincerely,')
    doc.moveDown(2)
    doc.font('Helvetica').fontSize(10).text(data.managerName)
    doc.text('Convenience Hub of Maryland')
    doc.text('202-579-2944')

    doc.end()
  })
}
