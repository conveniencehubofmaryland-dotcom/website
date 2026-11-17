import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getApplicantBySession, sbFetch } from '@/lib/shift-eligibility'
import { verifyTrainingToken } from '@/lib/training-token'

const TRAINING_STATUSES = ['orientation_signed', 'offer_signed', 'orientation_completed', 'ready_to_claim_shifts']

// Who is asking: their applied position, and whether the other positions are unlocked
// (unlocked once the FIRST module of the applied position is passed).
async function trainingAccess(req: NextRequest): Promise<{ position: string; unlocked: boolean } | null> {
  let applicant: { position: string | null; email: string } | null = null
  try {
    const token = req.headers.get('x-staff-token')
    if (token) {
      applicant = await getApplicantBySession(token)
    } else {
      const email = verifyTrainingToken(req.headers.get('x-training-token'))
      if (email) {
        const res = await sbFetch(
          `offer_letter_applicants?email=ilike.${encodeURIComponent(email)}&select=id,email,position,onboarding_status`
        )
        const rows = res.ok ? await res.json() : []
        const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null
        if (row && TRAINING_STATUSES.includes(String(row.onboarding_status))) {
          applicant = { position: row.position ?? null, email: row.email }
        }
      }
    }
  } catch {
    return null
  }
  if (!applicant || !applicant.position) return null

  const modsRes = await sbFetch(
    `training_modules?position=eq.${encodeURIComponent(applicant.position)}&select=id&order=created_at.asc&limit=1`
  )
  const mods = modsRes.ok ? await modsRes.json() : []
  const firstId: string | null = Array.isArray(mods) && mods.length > 0 ? mods[0].id : null

  let unlocked = firstId === null
  if (firstId) {
    const progRes = await sbFetch(
      `staff_module_progress?staff_email=ilike.${encodeURIComponent(applicant.email)}&status=eq.completed&module_id=eq.${firstId}&select=module_id&limit=1`
    )
    const prog = progRes.ok ? await progRes.json() : []
    unlocked = Array.isArray(prog) && prog.length > 0
  }
  return { position: applicant.position, unlocked }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const position = url.searchParams.get('position')
    const moduleId = url.searchParams.get('id')

    console.log('[training/modules] position:', position)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    // Locked content is never sent: the applicant must be signed in, and other positions stay locked until the first module is passed.
    const access = await trainingAccess(req)
    if (!access) {
      return NextResponse.json({ error: 'Please sign in or enter the email you applied with.' }, { status: 401 })
    }
    if (position && position !== access.position && !access.unlocked) {
      return NextResponse.json({ error: 'This position is locked until your first module is passed.' }, { status: 403 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase.from('training_modules').select('*')

    if (position) {
      query = query.eq('position', position)
    }

    if (moduleId) {
      query = query.eq('id', moduleId)
    }

    const { data, error } = await query

    if (error) {
      console.error('[training/modules] error:', error)
      return NextResponse.json({ error: 'Failed to fetch', details: error.message }, { status: 500 })
    }

    const allowed = (data || []).filter((m: { position: string }) => access.unlocked || m.position === access.position)
    if (moduleId && (data || []).length > 0 && allowed.length === 0) {
      return NextResponse.json({ error: 'This position is locked until your first module is passed.' }, { status: 403 })
    }

    // Never send answers to the browser; grading happens on the server.
    const safe = allowed.map((m: { quiz_questions?: { id: string; question: string; options: string[] }[] | null }) => ({
      ...m,
      quiz_questions: Array.isArray(m.quiz_questions)
        ? m.quiz_questions.map(q => ({ id: q.id, question: q.question, options: q.options }))
        : m.quiz_questions,
    }))
    return NextResponse.json(safe)
  } catch (err) {
    console.error('[training/modules] catch error:', err)
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, position, content, quiz_questions } = body

    if (!title?.trim() || !position?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { error } = await supabase.from('training_modules').insert([{
      title: title.trim(),
      description: description?.trim() || null,
      position: position.trim(),
      content: content || null,
      quiz_questions: Array.isArray(quiz_questions) ? quiz_questions : [],
    }])

    if (error) {
      return NextResponse.json({ error: 'Failed to create', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: String(err) }, { status: 500 })
  }
}
