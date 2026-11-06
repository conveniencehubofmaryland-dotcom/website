import { NextRequest, NextResponse } from 'next/server'
import { sbFetch, todayInEastern, type ShiftRow } from '@/lib/shift-eligibility'
import { sendSms } from '@/lib/sms'

// Sends a reminder to each staff member with a claimed shift tomorrow.
// Called once a day by a scheduled job, using the header x-cron-secret.
export async function GET(request: NextRequest) {
  return runReminders(request)
}

export async function POST(request: NextRequest) {
  return runReminders(request)
}

async function runReminders(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = todayInEastern(1)
  const res = await sbFetch(
    `shifts?date=eq.${tomorrow}&status=eq.claimed&reminder_sent_at=is.null&select=*`
  )
  if (!res.ok) return NextResponse.json({ error: 'Could not load shifts' }, { status: 500 })
  const shifts = (await res.json()) as ShiftRow[]
  const resendKey = process.env.RESEND_API_KEY
  let reminded = 0

  for (const shift of shifts) {
    const dateLabel = new Date(`${shift.date}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    const times = `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`
    const name = shift.staff_name || 'there'

    if (resendKey && shift.staff_email) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
            reply_to: ['conveniencehubofmaryland@gmail.com'],
            to: [shift.staff_email],
            subject: `Reminder: your shift is tomorrow, ${dateLabel}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #E8192C;">Shift Reminder</h2>
                <p>Hi ${name}, you have a shift tomorrow:</p>
                <table style="border-collapse: collapse; font-size: 14px; margin: 16px 0;">
                  <tr><td style="padding: 6px 16px 6px 0; color: #666;">Role</td><td style="font-weight: 600;">${shift.role}</td></tr>
                  <tr><td style="padding: 6px 16px 6px 0; color: #666;">Date</td><td style="font-weight: 600;">${dateLabel}</td></tr>
                  <tr><td style="padding: 6px 16px 6px 0; color: #666;">Time</td><td style="font-weight: 600;">${times}</td></tr>
                  <tr><td style="padding: 6px 16px 6px 0; color: #666;">Location</td><td style="font-weight: 600;">${shift.location}</td></tr>
                </table>
                <p>When you arrive, clock in on <a href="https://conveniencehubofmaryland.com/staff/my-shifts" style="color: #E8192C;">My Shifts</a>. Clock out when you finish, then confirm the shift is complete.</p>
                <p style="font-size: 14px; color: #555;">Questions? Call or text <a href="tel:+12025792944" style="color: #E8192C;">202-579-2944</a></p>
              </div>
            `,
          }),
        })
        if (!emailRes.ok) console.error('[reminders] email failed:', await emailRes.text())
      } catch (e) {
        console.error('[reminders] email error:', e)
      }
    }

    if (shift.staff_phone) {
      await sendSms(
        shift.staff_phone,
        `Hi ${name}, reminder: you have a shift tomorrow (${dateLabel}, ${times}) at ${shift.location}. Clock in on My Shifts when you arrive. Questions? 202-579-2944.`
      )
    }

    await sbFetch(`shifts?id=eq.${encodeURIComponent(shift.id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ reminder_sent_at: new Date().toISOString() }),
    })
    reminded++
  }

  return NextResponse.json({ date: tomorrow, checked: shifts.length, reminded })
}
