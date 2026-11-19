import { createClient } from '@supabase/supabase-js'
import { sendAdminEmail, sendUserEmailHtml } from '@/lib/email'
import { brandedEmailHtml } from '@/lib/email-brand'

// Shared no-show logic, used by the admin button and the automatic check.
// Once a staff member reaches this many no-shows, they cannot claim new shifts until admin lowers the count.
export const NO_SHOW_CLAIM_LIMIT = 2

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export type NoShowResult =
  | { ok: true; applicantName: string; noShowCount: number; blocked: boolean }
  | { ok: false; status: number; error: string }

export async function recordNoShow(params: {
  applicantId: string
  shiftId: string
  notes?: string | null
  markedBy: 'admin' | 'auto'
}): Promise<NoShowResult> {
  const { applicantId, shiftId, notes, markedBy } = params

  // The shift must still be a claimed shift. A shift can only be marked once.
  const { data: shift } = await supabase
    .from('shifts')
    .select('status, date, start_time, location, role')
    .eq('id', shiftId)
    .maybeSingle()

  if (!shift) return { ok: false, status: 404, error: 'Shift not found' }
  if (shift.status === 'no_show') {
    return { ok: false, status: 409, error: 'This shift is already marked as a no-show.' }
  }

  const { data: applicant, error: fetchError } = await supabase
    .from('offer_letter_applicants')
    .select('no_show_count, full_name, email')
    .eq('id', applicantId)
    .single()

  if (fetchError || !applicant) return { ok: false, status: 404, error: 'Applicant not found' }

  const newCount = (applicant.no_show_count || 0) + 1

  const { error: updateError } = await supabase
    .from('offer_letter_applicants')
    .update({ no_show_count: newCount, last_no_show_date: new Date().toISOString() })
    .eq('id', applicantId)
  if (updateError) throw updateError

  const { error: logError } = await supabase
    .from('no_show_log')
    .insert({
      applicant_id: applicantId,
      shift_id: shiftId,
      notes: notes || (markedBy === 'auto' ? 'Automatic: no clock-in' : null),
      marked_by: markedBy,
    })
  if (logError) throw logError

  // Mark the shift itself, so it cannot be counted twice and drops off the active list
  const { error: shiftError } = await supabase
    .from('shifts')
    .update({ status: 'no_show', updated_at: new Date().toISOString() })
    .eq('id', shiftId)
  if (shiftError) throw shiftError

  const firstName = String(applicant.full_name || '').trim().split(/\s+/)[0] || 'there'
  const shiftLine = `<p>Shift: <strong>${esc(shift.role || 'Shift')}</strong> on <strong>${esc(shift.date)}</strong>${shift.start_time ? ` at ${esc(String(shift.start_time).slice(0, 5))}` : ''}${shift.location ? `, ${esc(shift.location)}` : ''}.</p>`

  if (applicant.email) {
    await sendUserEmailHtml(
      applicant.email,
      'Missed shift notice from Convenience Hub of Maryland',
      brandedEmailHtml(`<h2 style="color:#E8192C;margin:0 0 12px 0">Missed shift notice</h2>
<p>Hi ${esc(firstName)},</p>
<p>Our records show you did not attend a shift you had claimed.</p>
${shiftLine}
<p>Repeated no-shows may affect your access to future shifts. If you believe this is a mistake, or you need to cancel a shift ahead of time, call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.</p>`)
    ).catch(e => console.error('[no-show] staff email error:', e))
  }

  const blocked = newCount >= NO_SHOW_CLAIM_LIMIT
  if (blocked) {
    await sendAdminEmail(
      `No-show alert: ${applicant.full_name}`,
      `${applicant.full_name} now has ${newCount} no-shows. They can no longer claim new shifts until you lower their count on the Staff Records page. The staff member has been emailed about this shift.`
    ).catch(e => console.error('[no-show] admin email error:', e))
  }

  return { ok: true, applicantName: applicant.full_name, noShowCount: newCount, blocked }
}
