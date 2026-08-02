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
  try {
    const { full_name, email, applicant_id } = await req.json()
if (!full_name || !email || !applicant_id) {
  return NextResponse.json({ error: 'Full Name, Email, and Applicant ID are required' }, { status: 400 })
}
    // Generate unique invite token
    const invite_token = crypto.randomBytes(32).toString('hex')
    const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    // Create invite record
    const { error: insertError } = await supabase.from('staff_invites').insert({
  applicant_id,
  invite_token,
  email,
  status: 'pending',
  expires_at: expires_at.toISOString(),
})

    if (insertError) throw insertError

    // Build onboarding button link
    const onboarding_link = `https://conveniencehubofmaryland.com/staff?invite_token=${invite_token}`
    
    // Build email HTML
    const emailHTML = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><div style="background-color: #c41e3a; padding: 20px; text-align: center; color: white;"><h1 style="margin: 0;">Welcome to CHM</h1></div><div style="padding: 30px;"><p>Hi ${full_name},</p><p>We&apos;re excited to have you join the Convenience Hub of Maryland team! 🌟</p><p>To get started with your onboarding, please click the button below:</p><div style="text-align: center; margin: 30px 0;"><a href="${onboarding_link}" style="display: inline-block; background-color: #c41e3a; color: white; padding: 15px 40px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px;">Start Your Onboarding</a></div><p style="color: #666; font-size: 14px;">This link will expire in 30 days. If you have any questions, please contact our HR team.</p><hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;"><p><strong>Contact Info:</strong><br>📧 conveniencehubofmaryland@gmail.com<br>📱 202-579-2944<br>Monday–Saturday, 9 AM–9 PM</p><p>Looking forward to working with you!</p><p><strong>The CHM Team</strong></p></div><div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;"><p>This is an automated message. Please do not reply to this email.</p></div></div>`
    
    // Send email with clickable button
    const { error: emailError } = await resend.emails.send({
      from: 'CHM Onboarding <onboarding@conveniencehubofmaryland.com>',
      to: email,
      subject: '🎉 Welcome to Convenience Hub of Maryland - Start Your Onboarding',
      html: emailHTML,
    })

    if (emailError) {
      console.error('[send-invite] Email error:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: `Invite sent to ${email}`,
      invite_token,
      applicant_name: full_name,
    })
  } catch (err) {
    console.error('[send-invite] Error:', err)
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}
