export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: 'Database not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/shifts?status=eq.available&order=date.asc`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!res.ok) {
      console.error('Supabase error:', res.status, await res.text())
      return Response.json({ error: 'Failed to fetch shifts' }, { status: 500 })
    }

    const shifts = await res.json()
    return Response.json(shifts)
  } catch (error) {
    console.error('Error fetching available shifts:', error)
    return Response.json({ error: 'Failed to fetch shifts' }, { status: 500 })
  }
}
