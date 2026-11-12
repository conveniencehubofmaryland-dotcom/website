import { NextRequest, NextResponse } from 'next/server'

// Confirms the request comes from a signed-in admin.
// Returns null when the admin is allowed, or a 401 response to send back.
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    })
    if (res.ok) return null
  } catch {
    // fall through to the 401 below
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
