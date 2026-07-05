import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth, dbUpdateAuth, dbDeleteAuth } from '@/lib/db'

async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const modules = await dbSelectAuth('training_modules', t, { order: 'created_at.desc' })
  return NextResponse.json(modules)
}

export async function POST(req: NextRequest) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await req.json()
  const { title, description, position, content } = body

  if (!title?.trim() || !position?.trim()) {
    return NextResponse.json({ error: 'Title and Position required' }, { status: 400 })
  }

  const { error } = await dbInsertAuth('training_modules', {
    title: title.trim(),
    description: description?.trim() || null,
    position: position.trim(),
    content: content?.trim() || null,
    quiz_questions: [],
  }, t)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
