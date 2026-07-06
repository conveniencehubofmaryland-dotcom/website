import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    console.log('[progress] POST request received')
    
    const body = await req.json()
    console.log('[progress] Body:', {
      staff_name: body.staff_name,
      staff_email: body.staff_email,
      module_id: body.module_id,
      quiz_score: body.quiz_score,
    })
    
    const { staff_name, staff_email, staff_phone, position, module_id, quiz_score } = body

    // Validate required fields
    if (!staff_name?.trim() || !staff_email?.trim() || !module_id?.trim()) {
      console.log('[progress] Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const finalScore = Math.round(quiz_score || 0)

    console.log('[progress] Inserting to database...')
    const { error: dbError } = await dbInsertService('staff_module_progress', {
      staff_name: staff_name.trim(),
      staff_email: staff_email.trim(),
      staff_phone: staff_phone?.trim() || null,
      position: position?.trim() || null,
      module_id,
      status: finalScore >= 80 ? 'completed' : 'failed',
      quiz_score: finalScore,
      completed_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error('[progress] Database error:', dbError)
      return NextResponse.json({ error: `Database error: ${dbError}` }, { status: 500 })
    }

    console.log('[progress] Data saved successfully')

    // Send certificate email if passed (80%+)
    if (finalScore >= 80) {
      console.log('[progress] Score 80+, sending certificate email...')
      try {
        const emailRes = await fetch(`${req.headers.get('origin')}/api/training/send-certificate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staff_name: staff_name.trim(),
            staff_email: staff_email.trim(),
            module_title: 'Training Module Certification',
            position: position?.trim() || 'Staff Member',
            quiz_score: finalScore,
            completed_at: new Date().toISOString(),
          }),
        })

        const emailData = await emailRes.json()
        console.log('[progress] Email send result:', emailData)
      } catch (emailErr) {
        console.error('[progress] Email send error:', emailErr)
        // Don't fail quiz submission if email fails
      }
    }

    console.log('[progress] Returning success')
    return NextResponse.json({ success: true, score: finalScore })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[progress] Exception:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
