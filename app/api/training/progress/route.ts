import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'
import { buildCertificateHtml, storeCertificate, getModuleTitle } from '@/lib/certificate'

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

    const passed = finalScore >= 80
    const completedAt = new Date().toISOString()
    const progressId = crypto.randomUUID()

    // On a pass, build the certificate once and store it so it can be viewed in Documents.
    let certificateUrl: string | null = null
    let moduleTitle = 'Training Module'
    if (passed) {
      moduleTitle = await getModuleTitle(module_id)
      const html = buildCertificateHtml({
        id: progressId,
        staffName: staff_name.trim(),
        moduleTitle,
        score: finalScore,
        completedAt,
      })
      certificateUrl = await storeCertificate(progressId, html)
    }

    console.log('[PROGRESS] Calling dbInsertService...')
    const { error } = await dbInsertService('staff_module_progress', {
      id: progressId,
      staff_name: staff_name.trim(),
      staff_email: staff_email.trim(),
      staff_phone: staff_phone?.trim() || null,
      position: position?.trim() || null,
      module_id,
      status: passed ? 'completed' : 'failed',
      quiz_score: finalScore,
      completed_at: completedAt,
      certificate_url: certificateUrl,
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
        const emailRes = await fetch(new URL('/api/training/send-certificate-email', req.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staff_name: staff_name.trim(),
            staff_email: staff_email.trim(),
            module_title: moduleTitle,
            position: position?.trim() || 'Staff',
            quiz_score: finalScore,
            completed_at: completedAt,
            certificate_url: certificateUrl,
          }),
        })
        if (!emailRes.ok) {
          console.error('[PROGRESS] Certificate email failed:', emailRes.status, await emailRes.text())
        } else {
          console.log('[PROGRESS] Email sent')
        }
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
