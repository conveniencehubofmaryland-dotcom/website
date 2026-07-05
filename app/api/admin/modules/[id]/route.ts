import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbUpdateAuth, dbDeleteAuth } from '@/lib/db'

async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { title, description, position, content } = body

  if (!title?.trim() || !position?.trim()) {
    return NextResponse.json({ error: 'Title and Position required' }, { status: 400 })
  }

  const { error } = await dbUpdateAuth('training_modules', {
    title: title.trim(),
    description: description?.trim() || null,
    position: position.trim(),
    content: content?.trim() || null,
  }, `id.eq.${id}`, t)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await dbDeleteAuth('training_modules', `id.eq.${id}`, t)

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
