import { NextRequest, NextResponse } from 'next/server'
import {
  getApplicantBySession,
  createEligibilityChecker,
  loadShift,
  sbFetch,
} from '@/lib/shift-eligibility'

export async function POST(request: NextRequest) {
  const { shiftId, staffPhone, sessionToken } = await request.json()

  if (!shiftId || !staffPhone || !sessionToken) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.error('[shifts] RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  try {
    // 1. Identify the staff member from their sign-in session
    const applicant = await getApplicantBySession(sessionToken)
    if (!applicant) {
      return NextResponse.json({ error: 'Please sign in again to claim shifts.' }, { status: 401 })
    }

    // 2. Load the shift and check it is still open
    const shift = await loadShift(shiftId)
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }
    if (shift.status !== 'available') {
      return NextResponse.json({ error: 'This shift has already been claimed.' }, { status: 409 })
    }

    // 3. Enforce eligibility (orientation, position match, training)
    const eligibility = await createEligibilityChecker(applicant)(shift)
    if (!eligibility.eligible) {
      return NextResponse.json({ error: eligibility.reason }, { status: 403 })
    }

    // 4. Claim only if still available (guards against two people claiming at once)
    const claimedAt = new Date().toISOString()
    const updateRes = await sbFetch(`shifts?id=eq.${encodeURIComponent(shiftId)}&status=eq.available`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        status: 'claimed',
        applicant_id: applicant.id,
        staff_name: applicant.full_name,
        staff_email: applicant.email,
        staff_phone: staffPhone,
        claimed_at: claimedAt,
      }),
    })
    const updated = await updateRes.json().catch(() => [])
    if (!updateRes.ok) {
      console.error('[shifts] PATCH failed:', updateRes.status, JSON.stringify(updated))
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
    if (!Array.isArray(updated) || updated.length === 0) {
      return NextResponse.json({ error: 'This shift was just claimed by someone else.' }, { status: 409 })
    }

    // 5. Customer details (only for shifts linked to a booking)
    let appointment: Record<string, string | null> = {}
    if (shift.appointment_id) {
      const apptRes = await sbFetch(
        `appointments?id=eq.${encodeURIComponent(shift.appointment_id)}&select=customer_name,phone,email,address,state,notes`
      )
      if (apptRes.ok) {
        const rows = await apptRes.json()
        appointment = Array.isArray(rows) && rows[0] ? rows[0] : {}
      }
    }

    const shiftDate = new Date(shift.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // 6. Email to staff member
    try {
      const staffEmailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
          reply_to: ['conveniencehubofmaryland@gmail.com'],
          to: [applicant.email],
          subject: `Shift Confirmed - ${shift.role} on ${shiftDate}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #E8192C; padding: 24px 32px; border-radius: 8px 8px 0 0;">
                <h1 style="color: #fff; font-size: 20px; margin: 0;">Shift Confirmation</h1>
              </div>
              <div style="background: #fff; border: 1px solid #eee; padding: 32px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 15px; color: #333;">Hi ${applicant.full_name},</p>
                <p style="font-size: 14px; color: #555;">Thank you for claiming the shift! Here are the details:</p>
                <table style="border-collapse: collapse; font-size: 14px; width: 100%; margin: 20px 0;">
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Customer Name</td>
                    <td style="color: #222; font-weight: 600;">${appointment.customer_name || 'N/A'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Customer Phone</td>
                    <td style="color: #222; font-weight: 600;"><a href="tel:${appointment.phone}" style="color: #E8192C;">${appointment.phone || 'N/A'}</a></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Customer Email</td>
                    <td style="color: #222; font-weight: 600;">${appointment.email || 'N/A'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Special Notes</td>
                    <td style="color: #222; white-space: pre-wrap;">${appointment.notes || 'None'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Pay Rate</td>
                    <td style="color: #222; font-weight: 600;">$${shift.pay_rate || 'TBD'}</td>
                  </tr>
                </table>
                ${shift.job_description ? `
                  <div style="margin: 20px 0;">
                    <h3 style="color: #333; margin-bottom: 10px;">Job Description:</h3>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; color: #555; white-space: pre-wrap;">
                      ${shift.job_description}
                    </div>
                  </div>
                ` : ''}
                <p style="font-size: 14px; color: #555; margin-top: 30px;">
                  When you arrive, clock in on the <a href="https://conveniencehubofmaryland.com/staff/my-shifts" style="color: #E8192C;">My Shifts</a> page. Clock out when you finish, then confirm the shift is complete.
                </p>
                <p style="font-size: 14px; color: #555; margin-top: 16px;">
                  Questions? Call or text <a href="tel:+12025792944" style="color: #E8192C;">202-579-2944</a>
                </p>
                <p style="font-size: 12px; color: #aaa; margin-top: 32px;">
                  Convenience Hub of Maryland &nbsp;·&nbsp; Maryland · Virginia · D.C.
                </p>
              </div>
            </div>
          `,
        }),
      })
      if (!staffEmailRes.ok) {
        console.error('[shifts] Staff email failed:', await staffEmailRes.text())
      }
    } catch (emailError) {
      console.error('[shifts] Error sending staff email:', emailError)
    }

    // 7. Email to company admin
    try {
      const adminEmailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CHM Shifts <support@conveniencehubofmaryland.com>',
          to: ['conveniencehubofmaryland@gmail.com'],
          subject: `New Shift Claim - ${shift.role} by ${applicant.full_name}`,
          html: `
            <h2 style="color: #E8192C;">New Shift Claim</h2>
            <table style="border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
              <tr><td style="padding: 6px 16px 6px 0; color: #666;">Shift</td><td style="font-weight: 600;">${shift.role}</td></tr>
              <tr><td style="padding: 6px 16px 6px 0; color: #666;">Date</td><td style="font-weight: 600;">${shiftDate}</td></tr>
              <tr><td style="padding: 6px 16px 6px 0; color: #666;">Time</td><td style="font-weight: 600;">${shift.start_time} - ${shift.end_time}</td></tr>
              <tr><td style="padding: 6px 16px 6px 0; color: #666;">Location</td><td style="font-weight: 600;">${shift.location}</td></tr>
              <tr><td style="padding: 6px 16px 6px 0; color: #666;">Pay Rate</td><td style="font-weight: 600;">$${shift.pay_rate || 'TBD'}</td></tr>
              <tr><td style="padding: 6px 16px 6px 0; color: #666;">Staff Name</td><td style="font-weight: 600;">${applicant.full_name}</td></tr>
              <tr><td style="padding: 6px 16px 6px 0; color: #666;">Phone</td><td><a href="tel:${staffPhone}" style="color: #E8192C;">${staffPhone}</a></td></tr>
              <tr><td style="padding: 6px 16px 6px 0; color: #666;">Email</td><td><a href="mailto:${applicant.email}" style="color: #E8192C;">${applicant.email}</a></td></tr>
            </table>
            <p style="margin-top: 16px;">
              <a href="https://conveniencehubofmaryland.com/admin/schedule"
                 style="background: #E8192C; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: 600; font-size: 13px; display: inline-block; border-radius: 4px;">
                View in Admin →
              </a>
            </p>
          `,
        }),
      })
      if (!adminEmailRes.ok) {
        console.error('[shifts] Admin email failed:', await adminEmailRes.text())
      }
    } catch (emailError) {
      console.error('[shifts] Error sending admin email:', emailError)
    }

    // 8. Email to the customer (only if the booking has an email on file)
    if (appointment.email) {
      try {
        const firstName = (applicant.full_name || '').split(' ')[0] || 'our team member'
        const customerFirst = (appointment.customer_name || '').split(' ')[0] || 'there'
        const customerRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
            reply_to: ['conveniencehubofmaryland@gmail.com'],
            to: [appointment.email],
            subject: `Your team member for ${shiftDate}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #E8192C;">Your Service Is Scheduled</h2>
                <p>Hi ${customerFirst}, ${firstName} has been assigned to your appointment.</p>
                <table style="border-collapse: collapse; font-size: 14px; margin: 16px 0;">
                  <tr><td style="padding: 6px 16px 6px 0; color: #666;">Date</td><td style="font-weight: 600;">${shiftDate}</td></tr>
                  <tr><td style="padding: 6px 16px 6px 0; color: #666;">Time</td><td style="font-weight: 600;">${shift.start_time} - ${shift.end_time}</td></tr>
                </table>
                <p style="font-size: 14px; color: #555;">Questions? Call or text <a href="tel:+12025792944" style="color: #E8192C;">202-579-2944</a></p>
              </div>
            `,
          }),
        })
        if (!customerRes.ok) {
          console.error('[shifts] Customer email failed:', await customerRes.text())
        }
      } catch (emailError) {
        console.error('[shifts] Error sending customer email:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[shifts] Error claiming shift:', error)
    return NextResponse.json({ error: 'Failed to claim shift' }, { status: 500 })
  }
}
