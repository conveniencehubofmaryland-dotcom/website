import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    console.log('[submit] Received FormData')

    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const sex = formData.get('sex') as string
    const date_of_birth = formData.get('date_of_birth') as string
    const position = formData.get('position') as string
    const years_of_experience = formData.get('years_of_experience') as string
    const acknowledged_1099 = formData.get('acknowledged_1099') === 'true'
    const own_car = formData.get('own_car') === 'yes'
    const backgroundCheckFile = formData.get('backgroundCheck') as File | null
    const invite_token = formData.get('invite_token') as string | null

    console.log('[submit] Received body:', { full_name, email, phone, sex, date_of_birth, position, years_of_experience, acknowledged_1099, own_car, hasBackgroundCheck: !!backgroundCheckFile })

    // Validate all required fields
    if (
      !full_name ||
      !email ||
      !phone ||
      !sex ||
      !date_of_birth ||
      !position ||
      years_of_experience === '' ||
      !acknowledged_1099
    ) {
      console.log('[submit] Validation failed - missing fields')
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate date of birth is in past
    const dob = new Date(date_of_birth)
    if (dob > new Date()) {
      console.log('[submit] DOB is in future')
      return NextResponse.json(
        { error: 'Date of birth must be in the past' },
        { status: 400 }
      )
    }

    // Validate years of experience
    const yearsExp = parseInt(years_of_experience)
    if (yearsExp < 0 || yearsExp > 80) {
      console.log('[submit] Invalid years of experience:', yearsExp)
      return NextResponse.json(
        { error: 'Years of experience must be between 0 and 80' },
        { status: 400 }
      )
    }

    // Upload background check file if provided
    let background_check_url: string | null = null
    if (backgroundCheckFile && backgroundCheckFile.size > 0) {
      try {
        const fileExt = backgroundCheckFile.name.split('.').pop()
        const fileName = `${email.replace(/[^a-z0-9]/gi, '_')}_background_check_${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('application-documents')
          .upload(fileName, backgroundCheckFile, {
            contentType: backgroundCheckFile.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('[submit] File upload error:', uploadError)
          return NextResponse.json(
            { error: 'Failed to upload background check' },
            { status: 500 }
          )
        }

        background_check_url = uploadData?.path || null
        console.log('[submit] Background check uploaded:', background_check_url)
      } catch (uploadErr) {
        console.error('[submit] Upload exception:', uploadErr)
        return NextResponse.json(
          { error: 'Failed to upload background check' },
          { status: 500 }
        )
      }
    }

    let applicant_id: string

    if (invite_token) {
      console.log('[submit] Processing with invite token:', invite_token)

      const { data: invite, error: inviteError } = await supabase
        .from('staff_invites')
        .select('applicant_id')
        .eq('invite_token', invite_token)
        .eq('status', 'pending')
        .single()

      if (inviteError) {
        console.error('[submit] Invite lookup error:', inviteError)
        return NextResponse.json(
          { error: 'Invalid or expired invite token' },
          { status: 400 }
        )
      }

      if (!invite) {
        console.log('[submit] No invite found for token:', invite_token)
        return NextResponse.json(
          { error: 'Invalid or expired invite token' },
          { status: 400 }
        )
      }

      applicant_id = invite.applicant_id
      console.log('[submit] Found applicant:', applicant_id)

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
          years_of_experience: yearsExp,
          acknowledged_1099,
          own_car,
          background_check_url,
          onboarding_status: 'profile_submitted',
          invited_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)

      if (updateError) {
        console.error('[submit] Update error:', updateError)
        throw updateError
      }

      // Mark invite as accepted
      const { error: acceptError } = await supabase
        .from('staff_invites')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('invite_token', invite_token)

      if (acceptError) {
        console.error('[submit] Accept invite error:', acceptError)
      }

      console.log('[submit] Applicant updated successfully')
    } else {
      console.log('[submit] Creating new applicant')

      // Create new applicant
      const { data: newApplicant, error: insertError } = await supabase
        .from('offer_letter_applicants')
        .insert({
          full_name,
          email,
          phone,
          sex,
          date_of_birth,
          position,
          years_of_experience: yearsExp,
          acknowledged_1099,
          own_car,
          background_check_url,
          onboarding_status: 'profile_submitted',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error('[submit] Insert error:', insertError)
        throw insertError
      }

      if (!newApplicant) {
        console.error('[submit] No applicant returned from insert')
        throw new Error('Failed to create applicant')
      }

      applicant_id = newApplicant.id
      console.log('[submit] New applicant created:', applicant_id)
    }

    // Send confirmation email to applicant
    console.log('[submit] Sending email to:', email)
    const emailRes = await resend.emails.send({
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
            
            <p><strong>What&apos;s next?</strong></p>
            <ol>
              <li>You&apos;ll receive an email with your orientation document to review and sign</li>
              <li>Complete the required training modules</li>
              <li>Start claiming shifts in the portal</li>
            </ol>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              <strong>Your Information:</strong><br>
              Name: ${full_name}<br>
              Email: ${email}<br>
              Phone: ${phone}<br>
              Position: ${position}<br>
              Years of Experience: ${yearsExp}<br>
              Own a Vehicle: ${own_car ? 'Yes' : 'No'}<br>
              ${backgroundCheckFile ? 'Background Check: Uploaded' : 'Background Check: Not provided'}
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

    if (emailRes.error) {
      console.error('[submit] Email send error:', emailRes.error)
    } else {
      console.log('[submit] Email sent successfully to:', email)
    }

    // Send notification to admin
    console.log('[submit] Sending admin notification')
    const adminRes = await resend.emails.send({
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
          <p><strong>Years of Experience:</strong> ${yearsExp}</p>
          <p><strong>Acknowledged 1099:</strong> ${acknowledged_1099 ? 'Yes' : 'No'}</p>
          <p><strong>Own a Vehicle:</strong> ${own_car ? 'Yes' : 'No'}</p>
          ${background_check_url ? '<p><strong>Background Check:</strong> Document uploaded</p>' : '<p><strong>Background Check:</strong> Not provided</p>'}
          <p><a href="https://conveniencehubofmaryland.com/admin/staff-records">View in Staff Records →</a></p>
        </div>
      `,
    })

    if (adminRes.error) {
      console.error('[submit] Admin email error:', adminRes.error)
    } else {
      console.log('[submit] Admin notification sent')
    }

    console.log('[submit] Success - applicant:', applicant_id)
    return NextResponse.json({
      success: true,
      applicant_id,
      message: 'Profile submitted successfully',
    })
  } catch (err) {
    console.error('[submit] Fatal error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
