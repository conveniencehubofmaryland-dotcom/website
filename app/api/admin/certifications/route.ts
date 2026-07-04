import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, serviceKey)

export async function GET() {
  try {
    const { data: progress, error: progressError } = await supabase
      .from('staff_module_progress')
      .select('*')
      .order('completed_at', { ascending: false, nullsLast: true })

    if (progressError) throw progressError

    // Get module titles
    const { data: modules, error: modulesError } = await supabase
      .from('training_modules')
      .select('id, title')

    if (modulesError) throw modulesError

    // Merge data
    const merged = progress.map(p => {
      const moduleData = modules?.find(m => m.id === p.module_id)
      return {
        ...p,
        module_title: moduleData?.title || 'Unknown Module',
      }
    })

    return NextResponse.json(merged)
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 })
  }
}
