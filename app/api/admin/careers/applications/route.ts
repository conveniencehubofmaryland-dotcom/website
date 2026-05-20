import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { JobApplication } from '@/lib/types'


async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

export async function GET(req: NextRequest) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const params: Record<string, string> = { order: 'created_at.desc' }
  if (status && status !== 'all') params.status = `eq.${status}`

  const applications = await dbSelectAuth<JobApplication>('job_applications', t, params)
  return NextResponse.json(applications)
}
