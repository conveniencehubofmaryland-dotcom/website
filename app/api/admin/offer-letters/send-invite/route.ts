import { requireAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { full_name, email, phone } = await req.json()

    if (!full_name || !email) {
      return NextResponse.json(
        { error: 'Full Name and Email are required' },
        { status: 400 }
      )
    }

    // 1. Create new applicant record
    const { data: newApplicant, error: applicantError } = await supabase
      .from('offer_letter_applicants')
      .insert({
        full_name,
        email,
        phone: phone || null,
        position: 'Pending',
        status: 'draft',
        onboarding_status: 'new',
      })
      .select('id')
      .single()

    if (applicantError || !newApplicant) {
      console.error('[send-invite] Applicant creation error:', applicantError)
      throw applicantError || new Error('Failed to create applicant record')
    }

    const applicant_id = newApplicant.id

    // 2. Generate unique invite token
    const invite_token = crypto.randomBytes(32).toString('hex')
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // 3. Create invite record
    const { error: insertError } = await supabase.from('staff_invites').insert({
      applicant_id,
      invite_token,
      email,
      status: 'pending',
      expires_at: expires_at.toISOString(),
    })

    if (insertError) throw insertError

    // 4. Build onboarding button link
    const onboarding_link = `https://conveniencehubofmaryland.com/staff?invite_token=${invite_token}`

    // 5. Build email HTML (minified to avoid template literal issues)
    const emailHTML = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #c41e3a; padding: 20px; text-align: center; color: white;"><h1 style="margin: 0;">Welcome to CHM</h1></div><div style="padding: 30px;"><p>Hi ${full_name},</p><p>We&apos;re excited to have you join the Convenience Hub of Maryland team! 🌟</p><p>To get started with your onboarding, please click the button below:</p><p style="background-color: #fff7e6; border: 1px solid #f0c36d; padding: 12px 16px; border-radius: 5px;"><strong>Please have your background check document ready.</strong> It must be dated within the last 6 months, and you will need to upload it when you submit your application.</p><div style="text-align: center; margin: 30px 0;"><a href="${onboarding_link}" style="display: inline-block; background-color: #c41e3a; color: white; padding: 15px 40px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px;">Start Your Onboarding</a></div><p style="color: #666; font-size: 14px;">This link will expire in 30 days. If you have any questions, please contact our HR team.</p><hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;"><p><strong>Contact Info:</strong><br>📧 conveniencehubofmaryland@gmail.com<br>📱 202-579-2944<br>Mon–Sat 7 AM–11 PM, Sun 9 AM–9 PM</p><p>Looking forward to working with you!</p><p><strong>The CHM Team</strong></p></div><div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;"><p>This is an automated message. Please do not reply to this email.</p></div></div>`

    // Plain-text version: spam filters trust emails that include one.
    const emailText = [
      `Hi ${full_name},`,
      '',
      'We are excited to have you join the Convenience Hub of Maryland team!',
      '',
      'To get started with your onboarding, please open this link:',
      onboarding_link,
      '',
      'Please have your background check document ready. It must be dated within the last 6 months, and you will need to upload it when you submit your application.',
      '',
      'This link will expire in 30 days. If you have any questions, please contact our HR team.',
      '',
      'Contact: conveniencehubofmaryland@gmail.com | 202-579-2944',
      'Mon-Sat 7 AM-11 PM, Sun 9 AM-9 PM',
      '',
      'The CHM Team',
    ].join('\n')

    // 6. Send email with clickable button
    const { error: emailError } = await resend.emails.send({
      from: 'CHM Onboarding <onboarding@conveniencehubofmaryland.com>',
      to: email,
      subject: 'Welcome to Convenience Hub of Maryland - Start Your Onboarding',
      html: emailHTML,
      text: emailText,
    })

    if (emailError) {
      console.error('[send-invite] Email error:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${email}`,
      invite_token,
      applicant_id,
      applicant_name: full_name,
    })
  } catch (err) {
    console.error('[send-invite] Error:', err)
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}
