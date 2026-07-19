import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { shiftId, staffName, staffEmail, staffPhone } = await request.json()

  if (!shiftId || !staffName || !staffEmail || !staffPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const resendApiKey = process.env.RESEND_API_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  if (!resendApiKey) {
    console.error('[shifts] RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  try {
    // 1. Fetch shift details
    const shiftRes = await fetch(
      `${supabaseUrl}/rest/v1/shifts?id=eq.${encodeURIComponent(shiftId)}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!shiftRes.ok) {
      console.error('[shifts] Error fetching shift:', shiftRes.status)
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const shifts = await shiftRes.json()
    if (!shifts || shifts.length === 0) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const shift = shifts[0]

    // 2. Update shift with staff details using service role
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/shifts?id=eq.${encodeURIComponent(shiftId)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'claimed',
          staff_name: staffName,
          staff_email: staffEmail,
          staff_phone: staffPhone,
          claimed_at: new Date().toISOString(),
        }),
      }
    )

    if (!updateRes.ok) {
      const errorText = await updateRes.text()
      console.error('[shifts] Error updating shift:', updateRes.status, errorText)
      return NextResponse.json({ error: 'Failed to claim shift' }, { status: 500 })
    }

    // 3. Format shift date
    const shiftDate = new Date(shift.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // 4. Send email to staff
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
          to: [staffEmail],
          subject: `Shift Confirmed - ${shift.role} on ${shiftDate}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #E8192C; padding: 24px 32px; border-radius: 8px 8px 0 0;">
                <h1 style="color: #fff; font-size: 20px; margin: 0;">Shift Confirmation</h1>
              </div>
              <div style="background: #fff; border: 1px solid #eee; padding: 32px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 15px; color: #333;">Hi ${staffName},</p>
                <p style="font-size: 14px; color: #555;">Thank you for claiming the shift! Here are the details:</p>
                
                <table style="border-collapse: collapse; font-size: 14px; width: 100%; margin: 20px 0;">
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888; width: 140px;">Date</td>
                    <td style="color: #222; font-weight: 600;">${shiftDate}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Start Time</td>
                    <td style="color: #222; font-weight: 600;">${shift.start_time}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">End Time</td>
                    <td style="color: #222; font-weight: 600;">${shift.end_time}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Location</td>
                    <td style="color: #222; font-weight: 600;">${shift.location}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 10px 0; color: #888;">Role</td>
                    <td style="color: #222; font-weight: 600;">${shift.role}</td>
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
      } else {
        console.log('[shifts] Staff email sent successfully')
      }
    } catch (emailError) {
      console.error('[shifts] Error sending staff email:', emailError)
    }

    // 5. Send email to company admin
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
          subject: `New Shift Claim - ${shift.role} by ${staffName}`,
          html: `
            <h2 style="color: #E8192C;">New Shift Claim</h2>
            <table style="border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
              <tr>
                <td style="padding: 6px 16px 6px 0; color: #666;">Shift</td>
                <td style="font-weight: 600;">${shift.role}</td>
              </tr>
              <tr>
                <td style="padding: 6px 16px 6px 0; color: #666;">Date</td>
                <td style="font-weight: 600;">${shiftDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 16px 6px 0; color: #666;">Time</td>
                <td style="font-weight: 600;">${shift.start_time} - ${shift.end_time}</td>
              </tr>
              <tr>
                <td style="padding: 6px 16px 6px 0; color: #666;">Location</td>
                <td style="font-weight: 600;">${shift.location}</td>
              </tr>
              <tr style="border-bottom: 2px solid #f0f0f0;">
                <td style="padding: 6px 16px 6px 0; color: #666;">Pay Rate</td>
                <td style="font-weight: 600;">$${shift.pay_rate || 'TBD'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 6px 16px 6px 0; color: #666;">Staff Name</td>
                <td style="font-weight: 600;">${staffName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 6px 16px 6px 0; color: #666;">Phone</td>
                <td><a href="tel:${staffPhone}" style="color: #E8192C;">${staffPhone}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 16px 6px 0; color: #666;">Email</td>
                <td><a href="mailto:${staffEmail}" style="color: #E8192C;">${staffEmail}</a></td>
              </tr>
            </table>
            <p style="margin-top: 16px;">
              <a href="https://conveniencehubofmaryland.com/admin/shifts"
                 style="background: #E8192C; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: 600; font-size: 13px; display: inline-block; border-radius: 4px;">
                View in Admin →
              </a>
            </p>
          `,
        }),
      })

      if (!adminEmailRes.ok) {
        console.error('[shifts] Admin email failed:', await adminEmailRes.text())
      } else {
        console.log('[shifts] Admin email sent successfully')
      }
    } catch (emailError) {
      console.error('[shifts] Error sending admin email:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[shifts] Error claiming shift:', error)
    return NextResponse.json({ error: 'Failed to claim shift' }, { status: 500 })
  }
}
