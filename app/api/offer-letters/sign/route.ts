import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { applicant_id } = body

  if (!applicant_id) {
    return NextResponse.json({ error: 'Missing applicant_id' }, { status: 400 })
  }

  // Generate a unique token
  const token = crypto.randomBytes(32).toString('hex')

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sign_token: token,
          updated_at: new Date().toISOString() 
        }),
      }
    )

    if (!res.ok) {
      console.error('[sign-offer] Supabase error:', await res.text())
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
    }

    return NextResponse.json({ success: true, token })
  } catch (err) {
    console.error('[sign-offer] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { applicant_id, token } = body

  if (!applicant_id || !token) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    // Verify token and update status
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${applicant_id}&sign_token=eq.${token}`,
      {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'signed',
          sign_token: null,
          updated_at: new Date().toISOString() 
        }),
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[sign-offer] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
