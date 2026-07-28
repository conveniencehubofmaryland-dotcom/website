import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type Applicant = {
  id: string
  full_name: string
  email: string
  phone: string
  position: string
  address: string | null
  orientation_accepted_at: string
  full_signature: string | null
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('chm_admin')?.value ?? ''

    console.log('[api-signed-doc] Fetching document:', id)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${id}`
    
    console.log('[api-signed-doc] Fetching from:', url)

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}!`,
        'Content-Type': 'application/json',
      },
    })

    console.log('[api-signed-doc] Response status:', res.status)

    if (!res.ok) {
      const errText = await res.text()
      console.error('[api-signed-doc] Fetch error:', res.status, errText)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const data: Applicant[] = await res.json()
    
    if (!data || data.length === 0) {
      console.log('[api-signed-doc] No applicant found')
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const applicant = data[0]
    console.log('[api-signed-doc] Found:', applicant.full_name)

    return NextResponse.json(applicant)
  } catch (err) {
    console.error('[api-signed-doc] Exception:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
