export async function POST(request: Request) {
  const { newPassword } = await request.json()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const res = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.staff_portal_password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey as string,
      Authorization: `Bearer ${supabaseKey as string}`,
    },
    body: JSON.stringify({ value: newPassword }),
  })

  if (!res.ok) return Response.json({ error: 'Failed to update password' }, { status: 500 })
  return Response.json({ success: true })
}
