import { NextRequest, NextResponse } from 'next/server'

type Applicant = {
  id: string
  full_name: string
  email: string
  position: string | null
  orientation_accepted: boolean | null
}

type Shift = {
  id: string
  date: string
  start_time: string
  end_time: string
  location: string
  role: string
  pay_rate: number | null
  job_description: string | null
  status: string | null
  appointment_id: string | null
}

type ClientDetails = {
  customer_name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
}

// Positions that do not require training modules (orientation is still required)
const NO_TRAINING_POSITIONS = ['Commercial Cleaner']

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const RESEND_KEY = process.env.RESEND_API_KEY

async function getRows<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY as string, Authorization: `Bearer ${SERVICE_KEY as string}` },
  })
  if (!res.ok) throw new Error(`Read failed for ${path}: ${res.status}`)
  return res.json()
}

async function sendEmail(to: string[], subject: string, html: string, from: string, replyTo?: string[]) {
  if (!RESEND_KEY) return
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    })
    if (!res.ok) console.error('[shifts] email failed:', await res.text())
  } catch (e) {
    console.error('[shifts] email error:', e)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const shiftId = String(body.shiftId || '').trim()
  const staffEmail = String(body.staffEmail || '').trim().toLowerCase()
  const staffPhone = String(body.staffPhone || '').trim()

  if (!shiftId || !staffEmail || !staffPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    // 1. Find the applicant by the email they applied with
    const applicants = await getRows<Applicant>(
      `offer_letter_applicants?email=ilike.${encodeURIComponent(staffEmail)}&select=id,full_name,email,position,orientation_accepted&limit=1`
    )
    const applicant = applicants[0]
    if (!applicant) {
      return NextResponse.json(
        { error: 'We could not find a staff profile for this email. Please use the email you applied with.' },
        { status: 403 }
      )
    }
    if (!applicant.orientation_accepted) {
      return NextResponse.json({ error: 'Please complete orientation before claiming shifts.' }, { status: 403 })
    }
    if (!applicant.position || applicant.position === 'Pending') {
      return NextResponse.json(
        { error: 'Your position has not been assigned yet. Please call 202-579-2944.' },
        { status: 403 }
      )
    }

    // 2. Find the shift
    const shifts = await getRows<Shift>(`shifts?id=eq.${encodeURIComponent(shiftId)}&select=*&limit=1`)
    const shift = shifts[0]
    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }
    if (shift.status !== 'available') {
      return NextResponse.json({ error: 'This shift has already been claimed.' }, { status: 409 })
    }

    // 3. The shift role must match the staff member's position
    if ((shift.role || '').trim().toLowerCase() !== applicant.position.trim().toLowerCase()) {
      return NextResponse.json(
        { error: `This shift is for ${shift.role}. Your position is ${applicant.position}.` },
        { status: 403 }
      )
    }

    // 4. Training: every module for the position must be completed,
    //    except for positions that do not require training
    if (!NO_TRAINING_POSITIONS.includes(applicant.position)) {
      const modules = await getRows<{ id: string }>(
        `training_modules?position=eq.${encodeURIComponent(applicant.position)}&select=id`
      )
      if (modules.length === 0) {
        return NextResponse.json(
          { error: 'Training for your position is not set up yet. Please call 202-579-2944.' },
          { status: 403 }
        )
      }
      const progress = await getRows<{ module_id: string }>(
        `staff_module_progress?staff_email=ilike.${encodeURIComponent(staffEmail)}&status=eq.completed&select=module_id`
      )
      const completed = new Set(progress.map(p => p.module_id))
      const remaining = modules.filter(m => !completed.has(m.id))
      if (remaining.length > 0) {
        return NextResponse.json(
          { error: 'Please complete all training modules for your position before claiming shifts.' },
          { status: 403 }
        )
      }
    }

    // 5. Claim the shift only if it is still available
    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/shifts?id=eq.${encodeURIComponent(shiftId)}&status=eq.available`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          status: 'claimed',
          staff_name: applicant.full_name,
          staff_email: applicant.email,
          staff_phone: staffPhone,
          staff_id: applicant.id,
          applicant_id: applicant.id,
          claimed_at: new Date().toISOString(),
        }),
      }
    )
    if (!patchRes.ok) {
      console.error('[shifts] PATCH failed:', patchRes.status, await patchRes.text())
      return NextResponse.json({ error: 'Could not save the claim. Please try again.' }, { status: 500 })
    }
    const updated = await patchRes.json()
    if (!Array.isArray(updated) || updated.length === 0) {
      return NextResponse.json({ error: 'This shift was just claimed by someone else.' }, { status: 409 })
    }

    // 6. Client details, if the shift is linked to an appointment
    let client: ClientDetails | null = null
    if (shift.appointment_id) {
      const appts = await getRows<ClientDetails>(
        `appointments?id=eq.${encodeURIComponent(shift.appointment_id)}&select=customer_name,phone,email,address,notes&limit=1`
      )
      client = appts[0] ?? null
    }

    const shiftDate = new Date(`${shift.date}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })

    // 7. Email the staff member
    await sendEmail(
      [applicant.email],
      `Shift Confirmed - ${shift.role} on ${shiftDate}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #E8192C; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; font-size: 20px; margin: 0;">Shift Confirmation</h1>
          </div>
          <div style="background: #fff; border: 1px solid #eee; padding: 32px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 15px; color: #333;">Hi ${applicant.full_name},</p>
            <p style="font-size: 14px; color: #555;">Thank you for claiming the shift! Here are the details:</p>
            <table style="border-collapse: collapse; font-size: 14px; width: 100%; margin: 20px 0;">
              <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 10px 0; color: #888;">Date</td><td style="color: #222; font-weight: 600;">${shiftDate}</td></tr>
              <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 10px 0; color: #888;">Time</td><td style="color: #222; font-weight: 600;">${shift.start_time} - ${shift.end_time}</td></tr>
              <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 10px 0; color: #888;">Location</td><td style="color: #222; font-weight: 600;">${shift.location}</td></tr>
              <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 10px 0; color: #888;">Customer Name</td><td style="color: #222; font-weight: 600;">${client?.customer_name || 'Details will be sent before the shift'}</td></tr>
              <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 10px 0; color: #888;">Customer Phone</td><td style="color: #222; font-weight: 600;">${client?.phone || 'N/A'}</td></tr>
              <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 10px 0; color: #888;">Special Notes</td><td style="color: #222; white-space: pre-wrap;">${client?.notes || 'None'}</td></tr>
              <tr><td style="padding: 10px 0; color: #888;">Pay Rate</td><td style="color: #222; font-weight: 600;">$${shift.pay_rate ?? 'TBD'}</td></tr>
            </table>
            ${shift.job_description ? `<div style="margin: 20px 0;"><h3 style="color: #333; margin-bottom: 10px;">Job Description:</h3><div style="background: #f5f5f5; padding: 15px; border-radius: 8px; color: #555; white-space: pre-wrap;">${shift.job_description}</div></div>` : ''}
            <p style="font-size: 14px; color: #555; margin-top: 30px;">Questions? Call or text <a href="tel:+12025792944" style="color: #E8192C;">202-579-2944</a></p>
            <p style="font-size: 12px; color: #aaa; margin-top: 32px;">Convenience Hub of Maryland &nbsp;·&nbsp; Maryland · Virginia · D.C.</p>
          </div>
        </div>
      `,
      'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
      ['conveniencehubofmaryland@gmail.com']
    )

    // 8. Email the admin
    await sendEmail(
      ['conveniencehubofmaryland@gmail.com'],
      `New Shift Claim - ${shift.role} by ${applicant.full_name}`,
      `
        <h2 style="color: #E8192C;">New Shift Claim</h2>
        <table style="border-collapse: collapse; font-family: sans-serif; font-size: 14px;">
          <tr><td style="padding: 6px 16px 6px 0; color: #666;">Shift</td><td style="font-weight: 600;">${shift.role}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #666;">Date</td><td style="font-weight: 600;">${shiftDate}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #666;">Time</td><td style="font-weight: 600;">${shift.start_time} - ${shift.end_time}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #666;">Location</td><td style="font-weight: 600;">${shift.location}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #666;">Pay Rate</td><td style="font-weight: 600;">$${shift.pay_rate ?? 'TBD'}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #666;">Staff Name</td><td style="font-weight: 600;">${applicant.full_name}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #666;">Phone</td><td><a href="tel:${staffPhone}" style="color: #E8192C;">${staffPhone}</a></td></tr>
          <tr><td style="padding: 6px 16px 6px 0; color: #666;">Email</td><td><a href="mailto:${applicant.email}" style="color: #E8192C;">${applicant.email}</a></td></tr>
        </table>
        <p style="margin-top: 16px;">
          <a href="https://conveniencehubofmaryland.com/admin/shifts" style="background: #E8192C; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: 600; font-size: 13px; display: inline-block; border-radius: 4px;">View in Admin →</a>
        </p>
      `,
      'CHM Shifts <support@conveniencehubofmaryland.com>',
      undefined
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[shifts] Error claiming shift:', error)
    return NextResponse.json({ error: 'Failed to claim shift' }, { status: 500 })
  }
}
