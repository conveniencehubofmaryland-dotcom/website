import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customer_name, phone, email, service_id, appointment_date, time_slot, notes } = body

  if (!customer_name?.trim() || !phone?.trim() || !service_id || !appointment_date || !time_slot) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { error } = await supabase.from('appointments').insert({
    customer_name: customer_name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    service_id,
    appointment_date,
    time_slot,
    notes: notes?.trim() || null,
    status: 'pending',
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to save booking. Please call us at 202-579-2944.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
