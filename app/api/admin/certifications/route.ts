import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'

async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get staff progress
  const progress = await dbSelectAuth('staff_module_progress', t)
  
  // Get modules for titles
  const modules = await dbSelectAuth('training_modules', t)

  // Merge - cast to proper types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const merged = (progress as any[]).map((p: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moduleData = (modules as any[]).find((m: any) => m.id === p.module_id)
    return {
      ...p,
      module_title: moduleData?.title || 'Unknown Module',
    }
  })

  return NextResponse.json(merged)
}
