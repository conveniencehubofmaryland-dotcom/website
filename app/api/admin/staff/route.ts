import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'
import { markApplicantReady } from '@/lib/ready-to-claim'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const denied = await requireAdmin(req)
  if (denied) return denied

  const body = await req.json()
  const {
    full_name,
    email,
    phone,
    sex,
    date_of_birth,
    position,
    years_of_experience,
    acknowledged_1099,
    onboarding_status,
    notes,
  } = body

  if (!full_name || !email || !phone || !sex || !date_of_birth || !position) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants`,
      {
        method: 'POST',
        headers: {
          ...serviceHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name,
          email,
          phone,
          sex,
          date_of_birth,
          position,
          years_of_experience: parseInt(String(years_of_experience), 10) || 0,
          acknowledged_1099: acknowledged_1099 === true,
          onboarding_status: onboarding_status || 'new',
          notes: notes || null,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!res.ok) {
      const errorBody = await res.text()
      console.error('[staff create] Supabase error:', errorBody)
      return NextResponse.json({ error: 'Failed to create staff record' }, { status: 500 })
    }

    const data = await res.json()
    return NextResponse.json(data[0] || data)
  } catch (err) {
    console.error('[staff create] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const denied = await requireAdmin(req)
  if (denied) return denied

  const body = await req.json()
  const {
    id,
    full_name,
    email,
    phone,
    sex,
    date_of_birth,
    position,
    years_of_experience,
    acknowledged_1099,
    onboarding_status,
    notes,
  } = body

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  try {
    // Moving a record to Ready to Claim Shifts sends the same congratulations email as the Ready button.
    // It runs only when the status is changing, so saving other fields does not resend the email.
    if (onboarding_status === 'ready_to_claim_shifts') {
      const curRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${id}&select=onboarding_status`,
        { headers: { ...serviceHeaders() } }
      )
      const cur = curRes.ok ? await curRes.json() : []
      if (cur[0]?.onboarding_status !== 'ready_to_claim_shifts') {
        const ready = await markApplicantReady(String(id))
        if (!ready.ok) return NextResponse.json({ error: ready.error }, { status: ready.status })
      }
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          ...serviceHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name,
          email,
          phone,
          sex,
          date_of_birth,
          position,
          years_of_experience: parseInt(String(years_of_experience), 10) || 0,
          acknowledged_1099: acknowledged_1099 === true,
          onboarding_status: onboarding_status || 'new',
          notes: notes || null,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!res.ok) {
      const errorBody = await res.text()
      console.error('[staff update] Supabase error:', errorBody)
      return NextResponse.json({ error: 'Failed to update staff record' }, { status: 500 })
    }

    // Fetch and return updated record
    const getRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${id}`,
      {
        headers: {
          ...serviceHeaders(),
        },
      }
    )

    const getData = await getRes.json()
    return NextResponse.json(getData[0] || getData)
  } catch (err) {
    console.error('[staff update] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
