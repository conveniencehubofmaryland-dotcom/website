import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'

async function getToken(): Promise<string> {
  const c = await cookies()
  const token = c.get('chm_admin')?.value ?? ''
  console.log('[modules API] Token from cookies:', token ? 'EXISTS' : 'MISSING')
  return token
}

export async function GET() {
  try {
    const t = await getToken()
    console.log('[modules API GET] Token:', t ? 'found' : 'MISSING')
    
    if (!t) {
      console.log('[modules API GET] No token, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[modules API GET] Calling dbSelectAuth...')
    const modules = await dbSelectAuth('training_modules', t)
    console.log('[modules API GET] Result:', { count: modules?.length, first: modules?.[0]?.title })

    return NextResponse.json(modules || [])
  } catch (err) {
    console.error('[modules API GET] Exception:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const t = await getToken()
    
    if (!t) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, position, content } = body

    if (!title?.trim() || !position?.trim()) {
      return NextResponse.json({ error: 'Title and Position required' }, { status: 400 })
    }

    console.log('[modules API POST] Creating module:', title)
    const { error } = await dbInsertAuth('training_modules', {
      title: title.trim(),
      description: description?.trim() || null,
      position: position.trim(),
      content: content?.trim() || null,
      quiz_questions: [],
    }, t)

    if (error) {
      console.error('[modules API POST] Error:', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    console.log('[modules API POST] Success')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[modules API POST] Exception:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
