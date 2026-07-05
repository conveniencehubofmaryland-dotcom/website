import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('[admin/modules] URL exists:', !!supabaseUrl)
    console.log('[admin/modules] Key exists:', !!serviceKey)

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    console.log('[admin/modules] Supabase client created')

    const { data, error } = await supabase
      .from('training_modules')
      .select('*')

    console.log('[admin/modules] Query result:', { count: data?.length, error })

    if (error) {
      console.error('[admin/modules] Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('[admin/modules] Exception:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)
    const body = await req.json()
    const { title, description, position, content } = body

    if (!title?.trim() || !position?.trim()) {
      return NextResponse.json({ error: 'Title and Position required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('training_modules')
      .insert([{
        title: title.trim(),
        description: description?.trim() || null,
        position: position.trim(),
        content: content?.trim() || null,
        quiz_questions: [],
      }])
      .select()

    if (error) {
      console.error('[admin/modules] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data?.[0] || {})
  } catch (err) {
    console.error('[admin/modules] Exception:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
