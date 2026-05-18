import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbPatchAuth } from '@/lib/db'


export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, approved } = await req.json()
  if (!id || typeof approved !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { error } = await dbPatchAuth('reviews', id, { approved }, token)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
