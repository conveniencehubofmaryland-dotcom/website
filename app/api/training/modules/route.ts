import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// Removed unused import

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

    console.log('[training/modules] found:', data?.length)
    return NextResponse.json(data || [])
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
