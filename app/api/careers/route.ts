cat > app/api/careers/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'

const VALID_STATES = ['MD', 'VA', 'DC']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, phone, email, address, city, state, gender, positions, days, hours, experience, has_license, has_insured_car } = body

    if (!name?.trim() || !phone?.trim() || !email?.trim() || !state) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!VALID_STATES.includes(state)) {
      return NextResponse.json({ error: 'We only hire in Maryland, Virginia, and Washington D.C.' }, { status: 400 })
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
      resume_url: null,
      status: 'new',
    })

    if (dbError) {
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
            html: `<h2 style="color:#E8192C">New Application</h2><p>${name.trim()} (${phone.trim()}, ${email.trim()})</p>`,
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
EOF
