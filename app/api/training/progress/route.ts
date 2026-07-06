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
    const body = await req.json()
    const { staff_name, staff_email, staff_phone, position, module_id, quiz_score, status } = body

    if (!staff_name?.trim() || !staff_email?.trim() || !staff_phone?.trim() || !module_id?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use dbInsertService (no auth required) instead of dbInsertAuth
    const { error } = await dbInsertService('staff_module_progress', {
      staff_name: staff_name.trim(),
      staff_email: staff_email.trim(),
      staff_phone: staff_phone.trim(),
      position: position?.trim() || null,
      module_id,
      status: 'completed',
      quiz_score: Math.round(quiz_score) || null,
      completed_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[progress] Insert error:', error)
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
    }

    // Send certificate email if 80%+
    if (quiz_score >= 80) {
      try {
        await fetch(`${req.headers.get('origin')}/api/training/send-certificate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            staff_name,
            staff_email,
            module_title: 'Training Module',
            position,
            quiz_score: Math.round(quiz_score),
            completed_at: new Date().toISOString(),
          }),
        })
      } catch (err) {
        console.error('Email error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[progress] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
