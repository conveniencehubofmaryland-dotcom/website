export async function POST(request: Request) {
  const { password } = await request.json()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const res = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.staff_portal_password`, {
    headers: { apikey: supabaseKey as string, Authorization: `Bearer ${supabaseKey as string}` },
  })

  const data = await res.json()
  const correctPassword = data[0]?.value

  if (password === correctPassword) {
    return Response.json({ success: true })
  }
  return Response.json({ error: 'Invalid password' }, { status: 401 })
}
