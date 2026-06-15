import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(request: NextRequest) {
  const { shiftId, staffName, staffEmail, staffPhone } = await request.json()

  if (!shiftId || !staffName || !staffEmail || !staffPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const companyEmail = 'conveniencehubofmaryland@gmail.com'

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
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
      console.error('Error fetching shift:', shiftRes.status)
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const shifts = await shiftRes.json()
    if (!shifts || shifts.length === 0) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const shift = shifts[0]

    // 2. Update shift with staff details
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/shifts?id=eq.${encodeURIComponent(shiftId)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
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
      console.error('Error updating shift:', updateRes.status, await updateRes.text())
      return NextResponse.json({ error: 'Failed to claim shift' }, { status: 500 })
    }

    // 3. Format shift details for emails
    const shiftDate = new Date(shift.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // 4. Send email to staff
    if (resend) {
      try {
        await resend.emails.send({
          from: companyEmail,
          to: staffEmail,
          subject: `Shift Confirmed - ${shift.role} on ${shiftDate}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #E8192C;">Shift Confirmation</h2>
              <p>Dear ${staffName},</p>
              <p>Thank you for claiming the shift! Here are the details:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date:</strong> ${shiftDate}</p>
                <p><strong>Start Time:</strong> ${shift.start_time}</p>
                <p><strong>End Time:</strong> ${shift.end_time}</p>
                <p><strong>Location:</strong> ${shift.location}</p>
                <p><strong>Role:</strong> ${shift.role}</p>
                <p><strong>Pay Rate:</strong> $${shift.pay_rate || 'TBD'}</p>
              </div>

              ${shift.job_description ? `
                <div style="margin: 20px 0;">
                  <h3>Job Description:</h3>
                  <p style="white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
                    ${shift.job_description}
                  </p>
                </div>
              ` : ''}

              <p style="margin-top: 30px; color: #666;">
                If you have any questions, please contact us at ${companyEmail} or call 202-579-2944.
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                Convenience Hub of Maryland
              </p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Error sending email to staff:', emailError)
      }

      // 5. Send email to company admin
      try {
        await resend.emails.send({
          from: companyEmail,
          to: companyEmail,
          subject: `New Shift Claim - ${shift.role} by ${staffName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #E8192C;">New Shift Claim</h2>
              <p>A staff member has claimed a shift. Here are the details:</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Shift Details:</h3>
                <p><strong>Date:</strong> ${shiftDate}</p>
                <p><strong>Start Time:</strong> ${shift.start_time}</p>
                <p><strong>End Time:</strong> ${shift.end_time}</p>
                <p><strong>Location:</strong> ${shift.location}</p>
                <p><strong>Role:</strong> ${shift.role}</p>
                <p><strong>Pay Rate:</strong> $${shift.pay_rate || 'TBD'}</p>
              </div>

              <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Staff Information:</h3>
                <p><strong>Name:</strong> ${staffName}</p>
                <p><strong>Email:</strong> ${staffEmail}</p>
                <p><strong>Phone:</strong> ${staffPhone}</p>
              </div>

              <p style="margin-top: 20px; color: #666;">
                You can view all claimed shifts in your admin panel.
              </p>
            </div>
          `,
        })
      } catch (emailError) {
        console.error('Error sending email to admin:', emailError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error claiming shift:', error)
    return NextResponse.json({ error: 'Failed to claim shift' }, { status: 500 })
  }
}
