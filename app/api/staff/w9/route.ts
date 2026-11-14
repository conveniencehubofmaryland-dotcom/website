import { NextRequest, NextResponse } from 'next/server'
import { getApplicantBySession, hasPassedTraining, sbFetch } from '@/lib/shift-eligibility'

const TAX_CLASSES = ['individual', 'single_member_llc', 'c_corp', 's_corp', 'partnership', 'other']

// Staff: is the W-9 form already on file, and may this applicant submit it (training passed)?
export async function GET(req: NextRequest) {
  const applicant = await getApplicantBySession(req.headers.get('x-staff-token'))
  if (!applicant) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })
  const trained = applicant.position ? await hasPassedTraining(applicant.email, applicant.position) : false
  const res = await sbFetch(`w9_forms?applicant_id=eq.${applicant.id}&select=id,signed_at&order=signed_at.desc&limit=1`)
  const rows = res.ok ? await res.json() : []
  return NextResponse.json({
    trained,
    submitted: Array.isArray(rows) && rows.length > 0,
    signed_at: Array.isArray(rows) && rows[0] ? rows[0].signed_at : null,
  })
}

// Staff: submit the W-9 after all training modules are passed.
export async function POST(req: NextRequest) {
  const applicant = await getApplicantBySession(req.headers.get('x-staff-token'))
  if (!applicant) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })

  const trained = applicant.position ? await hasPassedTraining(applicant.email, applicant.position) : false
  if (!trained) {
    return NextResponse.json({ error: 'Complete all required training modules before submitting the W-9.' }, { status: 403 })
  }

  const body = await req.json()
  const name = String(body.full_name || '').trim()
  const business = String(body.business_name || '').trim()
  const taxClass = String(body.tax_classification || '')
  const address = String(body.address || '').trim()
  const cityStateZip = String(body.city_state_zip || '').trim()
  const tin = String(body.tin || '').replace(/\D/g, '')
  const signature = String(body.signature_image || '')

  if (!name || !address || !cityStateZip) {
    return NextResponse.json({ error: 'Please fill in your name, address, city, state and ZIP.' }, { status: 400 })
  }
  if (!TAX_CLASSES.includes(taxClass)) {
    return NextResponse.json({ error: 'Please choose your federal tax classification.' }, { status: 400 })
  }
  if (tin.length !== 9) {
    return NextResponse.json({ error: 'Enter your 9-digit SSN or EIN.' }, { status: 400 })
  }
  if (!signature.startsWith('data:image/png;base64,') || signature.length > 300000) {
    return NextResponse.json({ error: 'Please draw your signature in the box.' }, { status: 400 })
  }

  const insert = await sbFetch('w9_forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({
      applicant_id: applicant.id,
      staff_email: applicant.email,
      full_name: name,
      business_name: business || null,
      tax_classification: taxClass,
      address,
      city_state_zip: cityStateZip,
      tin,
      signature_image: signature,
    }),
  })
  if (!insert.ok) {
    console.error('[w9] insert failed:', await insert.text())
    return NextResponse.json({ error: 'Could not save the W-9. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
