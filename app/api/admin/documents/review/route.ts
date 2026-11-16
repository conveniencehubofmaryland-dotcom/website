import { requireAdmin } from '@/lib/admin-auth'
import { sendUserEmailHtml } from '@/lib/email'
import { sbFetch } from '@/lib/shift-eligibility'
import { NextRequest, NextResponse } from 'next/server'

const DECISIONS = ['pending', 'cleared', 'not_cleared']

const LABELS: Record<string, string> = {
  direct_deposit: 'Direct Deposit Form or Voided Check',
  cpr_certification: 'CPR Certificate',
  first_aid_certification: 'First Aid Certificate',
  cmt_certificate: 'CMT Certificate',
  cna_certificate: 'CNA Certificate',
  staff_photo: 'Staff Photo',
}

// Admin marks an uploaded document or a training certificate Cleared, Not Cleared, or Pending.
// Not Cleared emails the applicant what to fix and where to send the corrected file.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { table, id, decision } = await req.json()
    if (!DECISIONS.includes(decision) || !id) {
      return NextResponse.json({ error: 'Invalid review' }, { status: 400 })
    }

    let applicantEmail = ''
    let applicantName = ''
    let label = 'document'

    if (table === 'staff_documents') {
      const [doc] = await (await sbFetch(`staff_documents?id=eq.${encodeURIComponent(id)}&select=staff_id,document_type`)).json()
      if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      const [person] = await (await sbFetch(`offer_letter_applicants?id=eq.${encodeURIComponent(doc.staff_id)}&select=full_name,email`)).json()
      if (!person) return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
      applicantEmail = person.email
      applicantName = person.full_name
      label = LABELS[doc.document_type] || 'document'
    } else if (table === 'staff_module_progress') {
      const [prog] = await (await sbFetch(`staff_module_progress?id=eq.${encodeURIComponent(id)}&select=staff_email,staff_name,module_id`)).json()
      if (!prog) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
      applicantEmail = prog.staff_email
      applicantName = prog.staff_name
      const [mod] = await (await sbFetch(`training_modules?id=eq.${encodeURIComponent(prog.module_id)}&select=title`)).json()
      label = `Training Certificate: ${mod?.title || 'training module'}`
    } else {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const update = await sbFetch(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ review_status: decision }),
    })
    if (!update.ok) return NextResponse.json({ error: 'Could not update the review' }, { status: 500 })

    if (decision === 'not_cleared') {
      await sendUserEmailHtml(
        applicantEmail,
        `Action needed: please correct your ${label}`,
        `<p>Hi ${applicantName},</p>
         <p>Your <strong>${label}</strong> could not be cleared. Please check it and make the needed corrections.</p>
         <p>Then send the corrected document to <strong>conveniencehubofmaryland@gmail.com</strong>, with your full name in the subject line.</p>
         <p>Questions? Call 202-579-2944.</p>
         <p>Convenience Hub of Maryland</p>`
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[documents/review] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
