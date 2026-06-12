export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const res = await fetch(`${supabaseUrl}/rest/v1/shifts?status=eq.available&order=date.asc`, {
    headers: { apikey: supabaseKey as string, Authorization: `Bearer ${supabaseKey as string}` },
  })

  if (!res.ok) return Response.json({ error: 'Failed to fetch shifts' }, { status: 500 })
  const shifts = await res.json()
  return Response.json(shifts)
}
