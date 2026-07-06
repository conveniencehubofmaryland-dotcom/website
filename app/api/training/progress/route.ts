import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    console.log('[PROGRESS] Request received')
    
    const body = await req.json()
    console.log('[PROGRESS] Body:', { staff_name: body.staff_name, module_id: body.module_id })

    const { staff_name, staff_email, staff_phone, position, module_id, quiz_score } = body

    if (!staff_name?.trim() || !staff_email?.trim() || !module_id?.trim()) {
      console.log('[PROGRESS] Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const finalScore = Math.round(quiz_score || 0)

    console.log('[PROGRESS] Calling dbInsertService...')
    const { error } = await dbInsertService('staff_module_progress', {
      staff_name: staff_name.trim(),
      staff_email: staff_email.trim(),
      staff_phone: staff_phone?.trim() || null,
      position: position?.trim() || null,
      module_id,
      status: finalScore >= 80 ? 'completed' : 'failed',
      quiz_score: finalScore,
      completed_at: new Date().toISOString(),
    })

    console.log('[PROGRESS] Insert result:', { error })

    if (error) {
      console.error('[PROGRESS] Database error:', error)
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }

    console.log('[PROGRESS] Success! Score:', finalScore)

    // Send email if 80+
    if (finalScore >= 80) {
      console.log('[PROGRESS] Sending certificate email...')
      try {
        await fetch(`${req.headers.get('origin')}/api/training/send-certificate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staff_name: staff_name.trim(),
            staff_email: staff_email.trim(),
            module_title: 'Training Module',
            position: position?.trim() || 'Staff',
            quiz_score: finalScore,
            completed_at: new Date().toISOString(),
          }),
        })
        console.log('[PROGRESS] Email sent')
      } catch (emailErr) {
        console.error('[PROGRESS] Email error:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[PROGRESS] Exception:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
