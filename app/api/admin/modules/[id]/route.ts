import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, serviceKey)

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, description, position, content } = body

    if (!title?.trim() || !position?.trim()) {
      return NextResponse.json({ error: 'Title and Position required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('training_modules')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        position: position.trim(),
        content: content || null,
      })
      .eq('id', id)
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('training_modules')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}
