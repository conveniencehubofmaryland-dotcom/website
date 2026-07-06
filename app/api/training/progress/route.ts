import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[PROGRESS] Received:', body)

    const { staff_name, staff_email, staff_phone, position, module_id, quiz_score } = body

    if (!staff_name || !staff_email || !module_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    console.log('[PROGRESS] Inserting to database...')
    const { error } = await dbInsertService('staff_module_progress', {
      staff_name,
      staff_email,
      staff_phone: staff_phone || null,
      position: position || null,
      module_id,
      status: quiz_score >= 80 ? 'completed' : 'failed',
      quiz_score: Math.round(quiz_score || 0),
      completed_at: new Date().toISOString(),
    })

    console.log('[PROGRESS] DB result:', { error })

    if (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }

    console.log('[PROGRESS] Success!')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PROGRESS] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
