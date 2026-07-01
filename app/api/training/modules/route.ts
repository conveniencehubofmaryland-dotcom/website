import { NextRequest, NextResponse } from 'next/server'
import { dbSelect, dbInsertService } from '@/lib/db'
import type { TrainingModule } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const position = url.searchParams.get('position')
    const moduleId = url.searchParams.get('id')

    console.log('[training/modules GET] position:', position, 'id:', moduleId)

    const params: Record<string, string> = {}
    if (position) params.position = `eq.${position}`
    if (moduleId) params.id = `eq.${moduleId}`

    console.log('[training/modules GET] params:', params)

    const modules = await dbSelect<TrainingModule>('training_modules', params)
    console.log('[training/modules GET] result count:', modules?.length, 'data:', modules)

    return NextResponse.json(modules)
  } catch (err) {
    console.error('[training/modules] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch modules', details: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, position, content, quiz_questions } = body

    console.log('[training/modules POST] received:', { title, position })

    if (!title?.trim() || !position?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error: dbError } = await dbInsertService('training_modules', {
      title: title.trim(),
      description: description?.trim() || null,
      position: position.trim(),
      content: content || null,
      quiz_questions: Array.isArray(quiz_questions) ? quiz_questions : [],
    })

    if (dbError) {
      console.error('[training/modules] POST error:', dbError)
      return NextResponse.json({ error: 'Failed to create module', details: String(dbError) }, { status: 500 })
    }

    console.log('[training/modules POST] success')
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[training/modules] error:', msg)
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 })
  }
}
