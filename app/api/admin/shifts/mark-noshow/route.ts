import { requireAdmin } from '@/lib/admin-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendAdminEmail, sendUserEmailHtml } from '@/lib/email'
import { brandedEmailHtml } from '@/lib/email-brand'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Once a staff member reaches this many no-shows, they cannot claim new shifts until admin lowers the count.
const NO_SHOW_CLAIM_LIMIT = 2

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { applicant_id, shift_id, notes } = await req.json()

    if (!applicant_id || !shift_id) {
      return NextResponse.json({ error: 'Missing applicant_id or shift_id' }, { status: 400 })
    }

    // The shift must still be a claimed shift. A shift can only be marked once.
    const { data: shift } = await supabase
      .from('shifts')
      .select('status, date, start_time, location, role')
      .eq('id', shift_id)
      .maybeSingle()

    if (!shift) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }
    if (shift.status === 'no_show') {
      return NextResponse.json({ error: 'This shift is already marked as a no-show.' }, { status: 409 })
    }

    // Get current no_show_count
    const { data: applicant, error: fetchError } = await supabase
      .from('offer_letter_applicants')
      .select('no_show_count, full_name, email')
      .eq('id', applicant_id)
      .single()

    if (fetchError || !applicant) {
      return NextResponse.json({ error: 'Applicant not found' }, { status: 404 })
    }

    const newCount = (applicant.no_show_count || 0) + 1

    // Update no_show_count
    const { error: updateError } = await supabase
      .from('offer_letter_applicants')
      .update({
        no_show_count: newCount,
        last_no_show_date: new Date().toISOString()
      })
      .eq('id', applicant_id)

    if (updateError) throw updateError

    // Log to no_show_log
    const { error: logError } = await supabase
      .from('no_show_log')
      .insert({
        applicant_id,
        shift_id,
        notes: notes || null,
        marked_by: 'admin',
      })

    if (logError) throw logError

    // Mark the shift itself, so it cannot be counted twice and drops off the active list
    const { error: shiftError } = await supabase
      .from('shifts')
      .update({ status: 'no_show', updated_at: new Date().toISOString() })
      .eq('id', shift_id)

    if (shiftError) throw shiftError

    const firstName = String(applicant.full_name || '').trim().split(/\s+/)[0] || 'there'
    const shiftLine = `<p>Shift: <strong>${esc(shift.role || 'Shift')}</strong> on <strong>${esc(shift.date)}</strong>${shift.start_time ? ` at ${esc(String(shift.start_time).slice(0, 5))}` : ''}${shift.location ? `, ${esc(shift.location)}` : ''}.</p>`

    // Notice to the staff member (skipped if there is no email on file)
    if (applicant.email) {
      await sendUserEmailHtml(
        applicant.email,
        'Missed shift notice from Convenience Hub of Maryland',
        brandedEmailHtml(`<h2 style="color:#E8192C;margin:0 0 12px 0">Missed shift notice</h2>
<p>Hi ${esc(firstName)},</p>
<p>Our records show you did not attend a shift you had claimed.</p>
${shiftLine}
<p>Repeated no-shows may affect your access to future shifts. If you believe this is a mistake, or you need to cancel a shift ahead of time, call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.</p>`)
      ).catch(e => console.error('[mark-noshow] staff email error:', e))
    }

    // Admin alert at the claim limit
    if (newCount >= NO_SHOW_CLAIM_LIMIT) {
      await sendAdminEmail(
        `No-show alert: ${applicant.full_name}`,
        `${applicant.full_name} now has ${newCount} no-shows. They can no longer claim new shifts until you lower their count on the Staff Records page. The staff member has been emailed about this shift.`
      ).catch(e => console.error('[mark-noshow] admin email error:', e))
    }

    return NextResponse.json({
      success: true,
      no_show_count: newCount,
      applicant_name: applicant.full_name,
      warning: newCount >= NO_SHOW_CLAIM_LIMIT ? `⚠️ ${newCount} no-shows - this staff member is blocked from claiming new shifts` : null,
    })
  } catch (err) {
    console.error('[mark-noshow] Error:', err)
    return NextResponse.json({ error: 'Failed to mark no-show' }, { status: 500 })
  }
}
