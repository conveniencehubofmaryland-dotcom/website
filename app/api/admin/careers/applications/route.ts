import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbDeleteAuth } from '@/lib/db'

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) {
    return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 })
  }

  const { error } = await dbDeleteAuth('job_applications', id, token)
  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ success: true })
}
