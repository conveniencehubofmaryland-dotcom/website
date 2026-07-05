import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbInsertAuth } from '@/lib/db'

function token(req?: NextRequest): Promise<string> {
  void req
  return cookies().then(c => c.get('chm_admin')?.value ?? '')
}

export async function GET() {
  const t = await token()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modules = await dbSelectAuth<any>('training_modules', t, { order: 'created_at.desc' })
  return NextResponse.json(modules)
}

export async function POST(req: NextRequest) {
  const t = await token(req)
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
