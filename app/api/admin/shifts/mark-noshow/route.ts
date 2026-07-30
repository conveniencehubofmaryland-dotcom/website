import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { applicant_id, shift_id, notes } = await req.json()

    if (!applicant_id || !shift_id) {
      return NextResponse.json({ error: 'Missing applicant_id or shift_id' }, { status: 400 })
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

    // Send alert email if 2+ no-shows
    if (newCount >= 2) {
      // TODO: Send email via Resend
      console.log(`[NO-SHOW ALERT] ${applicant.full_name} has ${newCount} no-shows`)
    }

    return NextResponse.json({
      success: true,
      no_show_count: newCount,
      applicant_name: applicant.full_name,
      warning: newCount >= 2 ? `⚠️ ${newCount} no-shows - may restrict future shifts` : null,
    })
  } catch (err) {
    console.error('[mark-noshow] Error:', err)
    return NextResponse.json({ error: 'Failed to mark no-show' }, { status: 500 })
  }
}
