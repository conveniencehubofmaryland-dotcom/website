import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'

// Admin only: read the current staff portal password.
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const res = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.staff_portal_password&select=value`, {
    headers: serviceHeaders(),
  })
  if (!res.ok) return NextResponse.json({ error: 'Failed to load password' }, { status: 500 })
  const data = await res.json()
  return NextResponse.json({ value: data[0]?.value || '' })
}

// Admin only: change the staff portal password.
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const { newPassword } = await request.json()
  if (!newPassword || !String(newPassword).trim()) {
    return NextResponse.json({ error: 'Password cannot be empty' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const res = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.staff_portal_password`, {
    method: 'PATCH',
    headers: serviceHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ value: String(newPassword).trim() }),
  })

  if (!res.ok) return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  return NextResponse.json({ success: true })
}
