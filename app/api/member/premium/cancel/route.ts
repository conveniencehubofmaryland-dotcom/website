import { NextResponse } from 'next/server'
import { getSessionMember } from '@/lib/member-session'
import { sbFetch } from '@/lib/shift-eligibility'
import { sendAdminEmail } from '@/lib/email'

// Member cancels Premium: back to Free, and no more automatic payments. No refund for the current period.
export async function POST() {
  const member = await getSessionMember()
  if (!member) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })
  if (member.tier !== 'premium') return NextResponse.json({ success: true })

  const save = await sbFetch(`members?id=eq.${member.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      tier: 'free',
      premium_billing: null,
      premium_next_charge_date: null,
      premium_clover_customer_id: null,
      premium_failed_attempts: 0,
      premium_last_error: null,
    }),
  })
  if (!save.ok) return NextResponse.json({ error: 'Could not cancel Premium. Please call 202-579-2944.' }, { status: 500 })

  await sendAdminEmail(
    `Premium cancelled: ${member.name}`,
    `${member.name} (${member.email}) cancelled Premium from the member portal. Their membership is now Free.`
  ).catch(e => console.error('[premium] cancel admin email error:', e))

  return NextResponse.json({ success: true })
}
