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

    // Get all staff progress
    const { data: progress, error: progressError } = await supabase
      .from('staff_module_progress')
      .select('*')
      .order('completed_at', { ascending: false, nullsFirst: false })

    if (progressError) {
      console.error('Progress error:', progressError)
      throw progressError
    }

    if (!progress || progress.length === 0) {
      return NextResponse.json([])
    }

    // Get module titles
    const { data: modules, error: modulesError } = await supabase
      .from('training_modules')
      .select('id, title')

    if (modulesError) {
      console.error('Modules error:', modulesError)
      throw modulesError
    }

    // Merge progress with module titles
    const merged = progress.map((p: any) => {
      const moduleData = modules?.find(m => m.id === p.module_id)
      return {
        ...p,
        module_title: moduleData?.title || 'Unknown Module',
      }
    })

    return NextResponse.json(merged)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Failed to fetch certifications' }, { status: 500 })
  }
}
