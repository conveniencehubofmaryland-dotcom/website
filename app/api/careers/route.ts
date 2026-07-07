import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'

const VALID_STATES = ['MD', 'VA', 'DC']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, address, city, state, gender, positions, days, hours, experience, has_license, has_insured_car, resume_base64, resume_filename, resume_type } = body

    if (!name?.trim() || !phone?.trim() || !email?.trim() || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!VALID_STATES.includes(state)) {
      return NextResponse.json({ error: 'We only hire in Maryland, Virginia, and Washington D.C.' }, { status: 400 })
    }

    let resumeUrl: string | null = null

    if (resume_base64 && resume_filename) {
      try {
        const safeName = resume_filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')
        const uniqueName = `${Date.now()}-${safeName}`
        const fileBuffer = Buffer.from(resume_base64, 'base64')

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/resumes/${uniqueName}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': resume_type || 'application/octet-stream',
            },
            body: fileBuffer,
          }
        )

        if (uploadRes.ok) {
          resumeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${uniqueName}`
        } else {
          console.error('[careers] Resume upload failed:', await uploadRes.text())
        }
      } catch (err) {
        console.error('[careers] Resume upload error:', err)
      }
    }

    const { error: dbError } = await dbInsertService('job_applications', {
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
      resume_url: resumeUrl,
      status: 'new',
    })

    if (dbError) {
      console.error('[careers] Database error:', JSON.stringify(dbError, null, 2))
      console.error('[careers] Service key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      return NextResponse.json({ error: 'Failed to save', details: String(dbError) }, { status: 500 })
    }

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
            ...(resume_base64 && resume_filename
              ? { attachments: [{ filename: resume_filename, content: resume_base64 }] }
              : {}),
            html: `<h2 style="color:#E8192C">New Job Application</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%">
<tr><td style="padding:8px 16px 8px 0;color:#666;font-weight:600">Name</td><td style="padding:8px 0;font-weight:600">${name.trim()}</td></tr>
<tr><td style="padding:8px 16px 8px 0;color:#666">Phone</td><td style="padding:8px 0"><a href="tel:${phone.trim()}">${phone.trim()}</a></td></tr>
<tr><td style="padding:8px 16px 8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
${address?.trim() ? `<tr><td style="padding:8px 16px 8px 0;color:#666">Address</td><td style="padding:8px 0">${address.trim()}</td></tr>` : ''}
${city?.trim() ? `<tr><td style="padding:8px 16px 8px 0;color:#666">City</td><td style="padding:8px 0">${city.trim()}</td></tr>` : ''}
<tr><td style="padding:8px 16px 8px 0;color:#666">State</td><td style="padding:8px 0">${state}</td></tr>
${gender?.trim() ? `<tr><td style="padding:8px 16px 8px 0;color:#666">Gender</td><td style="padding:8px 0">${gender.trim()}</td></tr>` : ''}
<tr><td style="padding:8px 16px 8px 0;color:#666">Active License</td><td style="padding:8px 0">${has_license === 'yes' ? '✓ Yes' : has_license === 'no' ? '✗ No' : '—'}</td></tr>
<tr><td style="padding:8px 16px 8px 0;color:#666">Insured Car</td><td style="padding:8px 0">${has_insured_car === 'yes' ? '✓ Yes' : has_insured_car === 'no' ? '✗ No' : '—'}</td></tr>
<tr><td style="padding:8px 16px 8px 0;color:#666">Positions</td><td style="padding:8px 0">${Array.isArray(positions) && positions.length ? positions.join(', ') : '—'}</td></tr>
<tr><td style="padding:8px 16px 8px 0;color:#666">Available Days</td><td style="padding:8px 0">${Array.isArray(days) && days.length ? days.join(', ') : '—'}</td></tr>
<tr><td style="padding:8px 16px 8px 0;color:#666">Available Hours</td><td style="padding:8px 0">${hours || '—'}</td></tr>
${experience?.trim() ? `<tr><td style="padding:8px 16px 8px 0;color:#666;vertical-align:top">Experience</td><td style="padding:8px 0">${experience.trim()}</td></tr>` : ''}
</table>
<p style="margin-top:20px;font-size:12px;color:#999"><a href="https://conveniencehubofmaryland.com/admin/careers/applications" style="color:#E8192C">View in Admin Panel</a></p>`,
          }),
        })
      } catch (err) {
        console.error('email error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[careers] error:', msg)
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 })
  }
}
