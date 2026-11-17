import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { removeStoredFiles, storagePathOf } from '@/lib/applicant-cleanup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY!)

// Removes files from the private identity bucket (admin-only).
async function removeStoredPrivateFiles(paths: string[]) {
  if (paths.length === 0) return
  await supabase.storage.from('applicant-private').remove(paths)
}

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
    const governmentIdFile = formData.get('governmentId') as File | null
    const socialSecurityCardFile = formData.get('socialSecurityCard') as File | null
    const invite_token = formData.get('invite_token') as string | null

    // Only invited applicants can apply. Walk-in applications are not accepted, so How It Works cannot be skipped.
    if (!invite_token) {
      return NextResponse.json(
        { error: 'Please open the link from your invitation email to start your application.' },
        { status: 400 }
      )
    }

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

    const address = String(formData.get('address') || '').trim()
    if (address.length < 10) {
      return NextResponse.json(
        { error: 'Please enter your full home address (street, city, state, ZIP).' },
        { status: 400 }
      )
    }

    if (!backgroundCheckFile || backgroundCheckFile.size === 0) {
      return NextResponse.json(
        { error: 'Background check document is required' },
        { status: 400 }
      )
    }

    // IRS Form W-9: the applicant attaches the completed official form.
    const w9File = formData.get('w9File') as File | null
    if (!w9File || w9File.size === 0) {
      return NextResponse.json({ error: 'Please attach your completed IRS Form W-9.' }, { status: 400 })
    }
    if (w9File.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'The W-9 file is larger than 10 MB.' }, { status: 400 })
    }

    // Identity documents: required, kept in the private bucket, admin-only.
    const ID_UPLOADS = [
      { file: governmentIdFile, docType: 'government_id', label: 'Government ID' },
      { file: socialSecurityCardFile, docType: 'social_security_card', label: 'Social Security Card' },
    ]
    if (formData.get('idNotExpired') !== 'true') {
      return NextResponse.json({ error: 'Please confirm your government-issued photo ID is not expired.' }, { status: 400 })
    }
    for (const d of ID_UPLOADS) {
      if (!d.file || d.file.size === 0) {
        return NextResponse.json({ error: `Please attach your ${d.label}.` }, { status: 400 })
      }
      if (d.file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `The ${d.label} file is larger than 10 MB.` }, { status: 400 })
      }
    }

    // Direct deposit and certificates. Required items must be attached; optional ones are saved only if attached.
    const DOC_UPLOADS = [
      { field: 'directDeposit', docType: 'direct_deposit', label: 'Direct Deposit Form', required: true },
      { field: 'cprCertificate', docType: 'cpr_certification', label: 'CPR Certificate', required: true },
      { field: 'firstAidCertificate', docType: 'first_aid_certification', label: 'First Aid Certificate', required: true },
      { field: 'cmtCertificate', docType: 'cmt_certificate', label: 'CMT Certificate', required: false },
      { field: 'cnaCertificate', docType: 'cna_certificate', label: 'CNA Certificate', required: false },
      { field: 'staffPhoto', docType: 'staff_photo', label: 'Staff Photo', required: true },
    ]
    const docUploads = DOC_UPLOADS.map(d => ({ ...d, file: formData.get(d.field) as File | null }))
    for (const d of docUploads) {
      if (d.required && (!d.file || d.file.size === 0)) {
        return NextResponse.json({ error: `Please attach your ${d.label}.` }, { status: 400 })
      }
      if (d.field === 'staffPhoto') {
        if (d.file && !['image/jpeg', 'image/png'].includes(d.file.type)) {
          return NextResponse.json({ error: 'Please upload your staff photo as a JPG or PNG.' }, { status: 400 })
        }
        if (d.file && d.file.size > 3 * 1024 * 1024) {
          return NextResponse.json({ error: 'Your staff photo must be 3 MB or smaller.' }, { status: 400 })
        }
      }
      if (d.file && d.file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: `The ${d.label} file is larger than 10 MB.` }, { status: 400 })
      }
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

      // Step gate: the applicant must have read How It Works and pressed Get Started first.
      const { data: gate } = await supabase
        .from('offer_letter_applicants')
        .select('onboarding_status')
        .eq('id', applicant_id)
        .single()
      if (!gate || !['how_it_works_read', 'profile_submitted'].includes(String(gate.onboarding_status))) {
        return NextResponse.json(
          { error: 'Please open the link from your invitation email and press Get Started on the How It Works page first.' },
          { status: 400 }
        )
      }

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
          address,
          background_check_url,
          onboarding_status: 'profile_submitted',
          invited_at: new Date().toISOString(),
        })
        .eq('id', applicant_id)

      if (updateError) {
        console.error('[submit] Update error:', updateError)
        throw updateError
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
          address,
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

    // Upload the completed W-9 form (only after the applicant is confirmed)
    let w9_file_path: string
    try {
      const w9Ext = (w9File.name.split('.').pop() || 'pdf').toLowerCase()
      const w9Name = `w9/${email.replace(/[^a-z0-9]/gi, '_')}_w9_${Date.now()}.${w9Ext}`
      const { data: w9Upload, error: w9UploadError } = await supabase.storage
        .from('application-documents')
        .upload(w9Name, w9File, {
          contentType: w9File.type,
          upsert: false,
        })
      if (w9UploadError || !w9Upload?.path) {
        console.error('[submit] W-9 upload error:', w9UploadError)
        return NextResponse.json({ error: 'Failed to upload your W-9. Please try again.' }, { status: 500 })
      }
      w9_file_path = w9Upload.path
    } catch (w9Err) {
      console.error('[submit] W-9 upload exception:', w9Err)
      return NextResponse.json({ error: 'Failed to upload your W-9. Please try again.' }, { status: 500 })
    }

    // A resubmitted W-9 replaces every earlier one for this person (rows and stored files),
    // including older records saved before they were linked to the applicant.
    const { data: w9ByApplicant } = await supabase.from('w9_forms').select('id, file_path').eq('applicant_id', applicant_id)
    const { data: w9ByEmail } = await supabase.from('w9_forms').select('id, file_path').ilike('staff_email', email)
    const oldW9 = [...(w9ByApplicant || []), ...(w9ByEmail || [])]
    const oldW9Ids = Array.from(new Set(oldW9.map(w => w.id)))
    const removed = await removeStoredFiles(oldW9.map(w => storagePathOf(w.file_path)).filter((p): p is string => !!p))
    if (!removed) {
      return NextResponse.json({ error: 'Could not replace the earlier W-9. Please try again.' }, { status: 500 })
    }
    if (oldW9Ids.length > 0) {
      await supabase.from('w9_forms').delete().in('id', oldW9Ids)
    }

    // Save the W-9 for this applicant.
    const w9Res = await supabase.from('w9_forms').insert({
      applicant_id,
      staff_email: email,
      full_name,
      file_path: w9_file_path,
    })
    if (w9Res.error) {
      console.error('[submit] W-9 save error:', w9Res.error)
      return NextResponse.json({ error: 'Could not save the W-9. Please try again.' }, { status: 500 })
    }

    // Save direct deposit and certificate uploads to this applicant's Documents in admin.
    for (const d of docUploads) {
      if (!d.file || d.file.size === 0) continue
      try {
        const ext = (d.file.name.split('.').pop() || 'pdf').toLowerCase()
        const path = `${applicant_id}/${Date.now()}-${d.docType}.${ext}`
        const { error: docUploadError } = await supabase.storage
          .from('application-documents')
          .upload(path, d.file, { contentType: d.file.type, upsert: false })
        if (docUploadError) throw docUploadError
        // A re-uploaded document of this type replaces the earlier one (row and stored file).
        const { data: oldDocs } = await supabase
          .from('staff_documents')
          .select('id, document_url')
          .eq('staff_id', applicant_id)
          .eq('document_type', d.docType)
        await removeStoredFiles((oldDocs || []).map(o => storagePathOf(o.document_url)).filter((p): p is string => !!p))
        if (oldDocs && oldDocs.length > 0) {
          await supabase.from('staff_documents').delete().in('id', oldDocs.map(o => o.id))
        }
        const { data: urlData } = supabase.storage.from('application-documents').getPublicUrl(path)
        const { error: docInsertError } = await supabase.from('staff_documents').insert({
          staff_id: applicant_id,
          document_type: d.docType,
          document_url: urlData.publicUrl,
          status: 'uploaded',
          notes: 'Uploaded by applicant on the welcome form',
          uploaded_at: new Date().toISOString(),
        })
        if (docInsertError) throw docInsertError
      } catch (docErr) {
        console.error('[submit] Document save error:', d.docType, docErr)
        return NextResponse.json({ error: `Could not save your ${d.label}. Please try again.` }, { status: 500 })
      }
    }

    // Save the identity documents to the PRIVATE bucket (admin-only). A re-upload replaces the earlier one.
    for (const d of ID_UPLOADS) {
      if (!d.file) continue
      try {
        const ext = (d.file.name.split('.').pop() || 'pdf').toLowerCase()
        const path = `${applicant_id}/${Date.now()}-${d.docType}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('applicant-private')
          .upload(path, d.file, { contentType: d.file.type, upsert: false })
        if (upErr) throw upErr

        const { data: oldDocs } = await supabase
          .from('staff_documents')
          .select('id, document_url')
          .eq('staff_id', applicant_id)
          .eq('document_type', d.docType)
        await removeStoredPrivateFiles((oldDocs || []).map(o => o.document_url).filter((p): p is string => !!p))
        if (oldDocs && oldDocs.length > 0) {
          await supabase.from('staff_documents').delete().in('id', oldDocs.map(o => o.id))
        }

        // Store the private PATH, not a public URL.
        const { error: docInsertError } = await supabase.from('staff_documents').insert({
          staff_id: applicant_id,
          document_type: d.docType,
          document_url: path,
          status: 'uploaded',
          notes: 'Uploaded by applicant on the welcome form (private)',
          uploaded_at: new Date().toISOString(),
        })
        if (docInsertError) throw docInsertError
      } catch (idErr) {
        console.error('[submit] Identity document save error:', d.docType, idErr)
        return NextResponse.json({ error: `Could not save your ${d.label}. Please try again.` }, { status: 500 })
      }
    }

    // Mark the invite accepted only after every upload is saved, so a failed upload can be retried with the same link.
    if (invite_token) {
      const { error: acceptError } = await supabase
        .from('staff_invites')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('invite_token', invite_token)
      if (acceptError) console.error('[submit] Accept invite error:', acceptError)
    }

    // Send confirmation email to applicant
    console.log('[submit] Sending email to:', email)
    const emailRes = await resend.emails.send({
      from: 'CHM Onboarding <onboarding@conveniencehubofmaryland.com>',
      to: email,
      subject: 'Welcome Profile Submitted - Next Steps',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #c41e3a; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">Profile Submitted!</h1>
          </div>

          <div style="padding: 30px;">
            <p>Hi ${full_name},</p>
            
            <p>Thank you for completing your welcome profile! </p>
            
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
            conveniencehubofmaryland@gmail.com<br>
            202-579-2944</p>

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
      subject: `New Profile Submission: ${full_name}`,
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
