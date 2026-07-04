import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const { data, error } = await supabase
      .from('training_modules')
      .select('id, title, description, position, content, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
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
      console.error('Supabase error:', error)
      throw error
    }

    return NextResponse.json(data[0])
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}
