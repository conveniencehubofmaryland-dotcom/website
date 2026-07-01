import { NextRequest, NextResponse } from 'next/server'
import { dbSelect, dbInsertService } from '@/lib/db'
import type { StaffModuleProgress } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const staffPhone = url.searchParams.get('phone')
    const moduleId = url.searchParams.get('module_id')

    let params: Record<string, string> = {}
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
    const body = await req.json()
    const { staff_name, staff_phone, position, module_id, quiz_score, status } = body

    if (!staff_name?.trim() || !staff_phone?.trim() || !module_id?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error: dbError } = await dbInsertService('staff_module_progress', {
      staff_name: staff_name.trim(),
      staff_phone: staff_phone.trim(),
      position: position?.trim() || null,
      module_id,
      status: status || 'in_progress',
      quiz_score: quiz_score || null,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })

    if (dbError) {
      console.error('[training/progress] POST error:', dbError)
      return NextResponse.json({ error: 'Failed to save progress', details: String(dbError) }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[training/progress] error:', msg)
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 })
  }
}
