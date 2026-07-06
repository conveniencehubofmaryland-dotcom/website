import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { dbSelect, dbInsertService } from '@/lib/db'
import type { StaffModuleProgress } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const staffPhone = url.searchParams.get('phone')
    const moduleId = url.searchParams.get('module_id')

    const params: Record<string, string> = {}
    if (staffPhone) params.staff_phone = `eq.${staffPhone}`
    if (moduleId) params.module_id = `eq.${moduleId}`

    const progress = await dbSelect<StaffModuleProgress>('staff_module_progress', params)
    return NextResponse.json(progress)
  } catch (err) {
    console.error('[training/progress] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[progress] POST request received')
    
    const body = await req.json()
    console.log('[progress] Body:', body)
    
    const { staff_name, staff_email, staff_phone, position, module_id, quiz_score } = body

    if (!staff_name?.trim() || !staff_email?.trim() || !module_id?.trim()) {
      console.log('[progress] Missing fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[progress] Calling dbInsertService...')
    const { error } = await dbInsertService('staff_module_progress', {
      staff_name: staff_name.trim(),
      staff_email: staff_email.trim(),
      staff_phone: staff_phone.trim() || null,
      position: position?.trim() || null,
      module_id,
      status: 'completed',
      quiz_score: Math.round(quiz_score) || null,
      completed_at: new Date().toISOString(),
    })

    console.log('[progress] dbInsertService result:', { error })

    if (error) {
      console.error('[progress] Database error:', error)
      return NextResponse.json({ error: String(error) }, { status: 500 })
    }

    console.log('[progress] Success')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[progress] Exception:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[progress] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
