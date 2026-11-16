import { requireAdmin } from '@/lib/admin-auth'
import { badgeFilePath } from '@/lib/badge-copy'
import { serviceHeaders } from '@/lib/supabase-keys'
import { NextRequest, NextResponse } from 'next/server'

// Admin-only: shows the saved copy of an applicant's staff badge.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const res = await fetch(`${url}/storage/v1/object/application-documents/${badgeFilePath(id)}`, {
    headers: serviceHeaders(),
  })
  if (!res.ok) {
    return NextResponse.json({ error: 'Badge copy not found' }, { status: 404 })
  }
  return new NextResponse(await res.text(), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex' },
  })
}
