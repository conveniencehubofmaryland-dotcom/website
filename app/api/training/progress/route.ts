import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    console.log('[PROGRESS] Request received')
    
    const body = await req.json()
    console.log('[PROGRESS] Body:', { staff_name: body.staff_name, module_id: body.module_id, score: body.quiz_score })

    const { staff_name, staff_email, staff_phone, position, module_id, quiz_score } = body

    if (!staff_name?.trim() || !staff_email?.trim() || !module_id?.trim()) {
      console.log('[PROGRESS] Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use direct Supabase insert with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('[PROGRESS] Missing Supabase config')
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    console.log('[PROGRESS] Inserting to staff_module_progress...')
    const { data, error } = await supabase
      .from('staff_module_progress')
      .insert([{
        staff_name: staff_name.trim(),
        staff_email: staff_email.trim(),
        staff_phone: staff_phone?.trim() || null,
        position: position?.trim() || null,
        module_id,
        status: Math.round(quiz_score || 0) >= 80 ? 'completed' : 'failed',
        quiz_score: Math.round(quiz_score || 0),
        completed_at: new Date().toISOString(),
      }])
      .select()

    console.log('[PROGRESS] Insert result:', { error, dataCount: data?.length })

    if (error) {
      console.error('[PROGRESS] Database error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[PROGRESS] Data saved! Returning success')
    return NextResponse.json({ success: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[PROGRESS] Exception:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
