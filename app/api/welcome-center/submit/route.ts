import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const {
      full_name,
      email,
      phone,
      sex,
      date_of_birth,
      position,
      years_of_experience,
      acknowledged_1099,
      invite_token,
    } = await req.json()

    // Validate all required fields
    if (
      !full_name ||
      !email ||
      !phone ||
      !sex ||
      !date_of_birth ||
      !position ||
      years_of_experience === null ||
      years_of_experience === undefined ||
      !acknowledged_1099
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate date of birth is in past
    const dob = new Date(date_of_birth)
    if (dob > new Date()) {
      return NextResponse.json(
        { error: 'Date of birth must be in the past' },
        { status: 400 }
      )
    }

    // Validate years of experience
    if (years_of_experience < 0 || years_of_experience > 80) {
      return NextResponse.json(
        { error: 'Years of experience must be between 0 and 80' },
        { status: 400 }
      )
    }

    // If invite_token provided, update existing applicant
    let applicant_id

    if (invite_token) {
      const { data: invite, error: inviteError } = await supabase
        .from('staff_invites')
        .select('applicant_id')
        .eq('invite_token', invite_token)
        .eq('status', 'pending')
        .single()

      if (inviteError || !invite) {
        return NextResponse.json(
          { error: 'Invalid or expired invite token' },
          { status: 400 }
        )
      }

      applicant_id = invite.applicant_id

      // Update existing applicant
      const { error: updateError } = await supabase
        .from('offer_letter_applicants')
        .update({
          full_name,
          email,
          phone,
          sex,
          date_of_birth,
          position,
          years_of_experience,
          acknowledged_1099,
          onboarding_status: 'profile_submitted',
          invited_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)

      if (updateError) throw updateError

      // Mark invite as accepted
      await supabase
        .from('staff_invites')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('invite_token', invite_token)
    } else {
      // Create new applicant (from direct form submission)
      const { data: newApplicant, error: insertError } = await supabase
        .from('offer_letter_applicants')
        .insert({
          full_name,
          email,
          phone,
          sex,
          date_of_birth,
          position,
          years_of_experience,
          acknowledged_1099,
          onboarding_status: 'profile_submitted',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) throw insertError
      applicant_id = newApplicant.id
    }

    // Send confirmation email to applicant
    await resend.emails.send({
      from: 'CHM Onboarding <onboarding@conveniencehubofmaryland.com>',
      to: email,
      subject: '✓ Welcome Profile Submitted - Next Steps',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #c41e3a; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Profile Submitted!</h1>
          </div>

          <div style="padding: 30px;">
            <p>Hi ${full_name},</p>
            
            <p>Thank you for completing your welcome profile! ✓</p>
            
            <p><strong>What's next?</strong></p>
            <ol>
              <li>You'll receive an email with your orientation document to review and sign</li>
              <li>Complete the required training modules</li>
              <li>Start claiming shifts in the portal</li>
            </ol>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>Your Information:</strong><br>
              Name: ${full_name}<br>
              Email: ${email}<br>
              Phone: ${phone}<br>
              Position: ${position}<br>
              Years of Experience: ${years_of_experience}
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p>Questions? Contact our HR team:<br>
            📧 conveniencehubofmaryland@gmail.com<br>
            📱 202-579-2944</p>

            <p><strong>The CHM Team</strong></p>
          </div>
        </div>
      `,
    })

    // Send notification to admin
    await resend.emails.send({
      from: 'CHM Admin <admin@conveniencehubofmaryland.com>',
      to: 'conveniencehubofmaryland@gmail.com',
      subject: `📋 New Profile Submission: ${full_name}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Profile Submission</h2>
          <p><strong>Name:</strong> ${full_name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Sex:</strong> ${sex}</p>
          <p><strong>Date of Birth:</strong> ${date_of_birth}</p>
          <p><strong>Position:</strong> ${position}</p>
          <p><strong>Years of Experience:</strong> ${years_of_experience}</p>
          <p><strong>Acknowledged 1099:</strong> ${acknowledged_1099 ? 'Yes' : 'No'}</p>
          <p><a href="https://conveniencehubofmaryland.com/admin/staff-records">View in Staff Records →</a></p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      applicant_id,
      message: 'Profile submitted successfully',
    })
  } catch (err) {
    console.error('[welcome-center] Error:', err)
    return NextResponse.json(
      { error: 'Failed to submit profile' },
      { status: 500 }
    )
  }
}
