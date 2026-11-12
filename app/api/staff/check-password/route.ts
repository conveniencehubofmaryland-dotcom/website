import { serviceHeaders } from '@/lib/supabase-keys'

export async function POST(request: Request) {
  const { password } = await request.json()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Read with the server-side service key so the password is never readable with the public key.
  const res = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.staff_portal_password`, {
    headers: serviceHeaders(),
  })

  const data = await res.json()
  const correctPassword = data[0]?.value

  if (password === correctPassword) {
    return Response.json({ success: true })
  }
  return Response.json({ error: 'Invalid password' }, { status: 401 })
}
