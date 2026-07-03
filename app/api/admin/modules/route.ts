import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, serviceKey)

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('training_modules')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
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
        content: content || null,
        quiz_questions: [],
      }])
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}
