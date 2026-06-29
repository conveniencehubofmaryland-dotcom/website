import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dbInsert } from '@/lib/db'

const VALID_STATES = ['MD', 'VA', 'DC']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const gender = formData.get('gender') as string
    const has_license = formData.get('has_license') as string
    const has_insured_car = formData.get('has_insured_car') as string
    const positions = JSON.parse(formData.get('positions') as string || '[]')
    const days = JSON.parse(formData.get('days') as string || '[]')
    const hours = formData.get('hours') as string
    const experience = formData.get('experience') as string
    const resumeFile = formData.get('resume') as File | null

    // Validation
    if (!name?.trim() || !phone?.trim() || !email?.trim() || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!VALID_STATES.includes(state)) {
      return NextResponse.json({ error: 'We only hire in Maryland, Virginia, and Washington D.C.' }, { status: 400 })
    }

    let resume_url = null

    // Upload resume if provided
    if (resumeFile && resumeFile.size > 0) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase credentials missing')
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Generate unique filename
        const timestamp = Date.now()
        const ext = resumeFile.name.split('.').pop() || 'pdf'
        const filename = `resumes/${timestamp}_${name.replace(/\s+/g, '_')}.${ext}`

        const arrayBuffer = await resumeFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('job-applications')
          .upload(filename, buffer, {
            contentType: resumeFile.type,
            upsert: false,
          })

        if (uploadError) {
          console.error('[careers] resume upload error:', uploadError)
        } else if (uploadData) {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('job-applications')
            .getPublicUrl(uploadData.path)
          resume_url = urlData?.publicUrl || null
        }
      } catch (err) {
        console.error('[careers] resume processing error:', err)
        // Continue without resume - not a blocker
      }
    }

    // Insert into database
    const { error: dbError } = await dbInsert('job_applications', {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address?.trim() || null,
      city: city?.trim() || null,
      state,
      gender: gender?.trim() || null,
      has_license: has_license || null,
      has_insured_car: has_insured_car || null,
      positions: Array.isArray(positions) ? positions : [],
      days: Array.isArray(days) ? days : [],
      hours: hours?.trim() || null,
      experience: experience?.trim() || null,
      resume_url,
      status: 'new',
    })

    if (dbError) {
      console.error('[careers] db error:', dbError)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // Send email notification
    const apiKey = process.env.RESEND_API_KEY
    if (apiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'CHM Careers <support@conveniencehubofmaryland.com>',
            to: ['conveniencehubofmaryland@gmail.com'],
            subject: `New Job Application — ${name.trim()}`,
            html: `
              <h2 style="color:#E8192C">New Job Application</h2>
              <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
                <tr><td style="padding:6px 16px 6px 0;color:#666">Name</td><td style="font-weight:600">${name.trim()}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td><a href="tel:${phone.trim()}">${phone.trim()}</a></td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td>${email.trim()}</td></tr>
                ${address?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Address</td><td>${address.trim()}</td></tr>` : ''}
                ${city?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666">City</td><td>${city.trim()}</td></tr>` : ''}
                <tr><td style="padding:6px 16px 6px 0;color:#666">State</td><td>${state}</td></tr>
                ${gender?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Gender</td><td>${gender.trim()}</td></tr>` : ''}
                ${has_license ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Active License</td><td>${has_license}</td></tr>` : ''}
                ${has_insured_car ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Insured Car</td><td>${has_insured_car}</td></tr>` : ''}
                <tr><td style="padding:6px 16px 6px 0;color:#666">Positions</td><td>${Array.isArray(positions) && positions.length ? positions.join(', ') : '—'}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666">Available Days</td><td>${Array.isArray(days) && days.length ? days.join(', ') : '—'}</td></tr>
                <tr><td style="padding:6px 16px 6px 0;color:#666">Available Hours</td><td>${hours || '—'}</td></tr>
                ${experience?.trim() ? `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">Experience</td><td>${experience.trim()}</td></tr>` : ''}
                ${resume_url ? `<tr><td style="padding:6px 16px 6px 0;color:#666">Resume</td><td><a href="${resume_url}">View Resume</a></td></tr>` : ''}
              </table>
            `,
          }),
        })
      } catch (err) {
        console.error('[careers] email error:', err)
        // Non-critical
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[careers] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
