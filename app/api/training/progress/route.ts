import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'
import { buildCertificateHtml, storeCertificate } from '@/lib/certificate'
import { sbFetch } from '@/lib/shift-eligibility'
import { verifyTrainingToken } from '@/lib/training-token'

// Applicants who have finished orientation may train.
const TRAINING_STATUSES = ['orientation_signed', 'offer_signed', 'orientation_completed', 'ready_to_claim_shifts']

type Applicant = { full_name: string; email: string; phone: string | null; position: string | null }
type Question = { id: string; correct_answer: string }

// The applicant is identified only by the verified training token, never by the request body.
async function applicantFromToken(req: NextRequest): Promise<Applicant | null> {
  const email = verifyTrainingToken(req.headers.get('x-training-token'))
  if (!email) return null
  const res = await sbFetch(
    `offer_letter_applicants?email=ilike.${encodeURIComponent(email)}&select=full_name,email,phone,position,onboarding_status`
  )
  if (!res.ok) return null
  const rows = await res.json()
  const row = Array.isArray(rows) ? rows[0] : null
  if (!row || !TRAINING_STATUSES.includes(String(row.onboarding_status))) return null
  return { full_name: row.full_name, email: row.email, phone: row.phone ?? null, position: row.position ?? null }
}

// The first module of a position (oldest first). Other positions unlock once it is passed.
async function firstModuleId(position: string): Promise<string | null> {
  const res = await sbFetch(
    `training_modules?position=eq.${encodeURIComponent(position)}&select=id&order=created_at.asc&limit=1`
  )
  if (!res.ok) return null
  const rows = (await res.json()) as { id: string }[]
  return rows.length > 0 ? rows[0].id : null
}

async function passedModuleIds(email: string): Promise<Set<string>> {
  const res = await sbFetch(
    `staff_module_progress?staff_email=ilike.${encodeURIComponent(email)}&status=eq.completed&select=module_id`
  )
  const rows = res.ok ? ((await res.json()) as { module_id: string }[]) : []
  return new Set(rows.map(r => r.module_id))
}

export async function POST(req: NextRequest) {
  try {
    const applicant = await applicantFromToken(req)
    if (!applicant) {
      return NextResponse.json({ error: 'Please verify your email before training.' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const moduleId = String(body.module_id || '').trim()
    const answers: Record<string, string> = body.answers && typeof body.answers === 'object' ? body.answers : {}
    if (!moduleId) return NextResponse.json({ error: 'Missing module.' }, { status: 400 })

    // Load the module from the database, with its answer key.
    const modRes = await sbFetch(`training_modules?id=eq.${encodeURIComponent(moduleId)}&select=id,title,position,quiz_questions`)
    const modRows = modRes.ok ? await modRes.json() : []
    const mod = Array.isArray(modRows) ? modRows[0] : null
    if (!mod) return NextResponse.json({ error: 'Module not found.' }, { status: 404 })

    // Lock check: other positions open only after the first module of the applied position is passed.
    if (!applicant.position) {
      return NextResponse.json({ error: 'Your applied position is not set yet. Please contact HR.' }, { status: 403 })
    }
    if (mod.position !== applicant.position) {
      const first = await firstModuleId(applicant.position)
      const passed = await passedModuleIds(applicant.email)
      if (first !== null && !passed.has(first)) {
        return NextResponse.json({ error: 'This position is locked until your first module is passed.' }, { status: 403 })
      }
    }

    // Grade on the server.
    const questions: Question[] = Array.isArray(mod.quiz_questions) ? mod.quiz_questions : []
    if (questions.length === 0) return NextResponse.json({ error: 'This module has no quiz.' }, { status: 400 })
    const correct = questions.filter(q => answers[q.id] === q.correct_answer).length
    const finalScore = Math.round((correct / questions.length) * 100)
    const passed = finalScore >= 80

    const completedAt = new Date().toISOString()
    const progressId = crypto.randomUUID()

    let certificateUrl: string | null = null
    if (passed) {
      const html = buildCertificateHtml({
        id: progressId,
        staffName: applicant.full_name.trim(),
        moduleTitle: mod.title || 'Training Module',
        score: finalScore,
        completedAt,
      })
      certificateUrl = await storeCertificate(progressId, html)
    }

    const { error } = await dbInsertService('staff_module_progress', {
      id: progressId,
      staff_name: applicant.full_name.trim(),
      staff_email: applicant.email.trim(),
      staff_phone: applicant.phone,
      position: mod.position,
      module_id: mod.id,
      status: passed ? 'completed' : 'failed',
      quiz_score: finalScore,
      completed_at: completedAt,
      certificate_url: certificateUrl,
    })
    if (error) {
      console.error('[PROGRESS] Database error:', error)
      return NextResponse.json({ error: 'There was a problem saving your result. Please contact HR.' }, { status: 500 })
    }

    if (passed) {
      try {
        await fetch(new URL('/api/training/send-certificate-email', req.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staff_name: applicant.full_name.trim(),
            staff_email: applicant.email.trim(),
            module_title: mod.title,
            position: mod.position,
            quiz_score: finalScore,
            completed_at: completedAt,
            certificate_url: certificateUrl,
          }),
        })
      } catch (emailErr) {
        console.error('[PROGRESS] Certificate email error:', emailErr)
      }
    }

    return NextResponse.json({ success: true, score: finalScore, passed })
  } catch (err) {
    console.error('[PROGRESS] Exception:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
