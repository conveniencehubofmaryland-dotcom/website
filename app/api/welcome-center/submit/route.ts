import { NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'

export async function POST(req: Request) {
  const body = await req.json()
  const { full_name, email, phone, position, address } = body

  if (!full_name?.trim() || !email?.trim() || !phone?.trim() || !position?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await dbInsertService('offer_letter_applicants', {
    full_name: full_name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    position: position.trim(),
    address: address?.trim() || null,
    status: 'draft',
  })

  if (error) {
    console.error('[welcome-center] Supabase insert failed:', error)
    return NextResponse.json({ error: 'Failed to save your information. Please try again or call us.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
