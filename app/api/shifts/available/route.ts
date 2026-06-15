export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.log('Supabase Key:', supabaseKey ? 'SET' : 'MISSING')

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  try {
    const url = `${supabaseUrl}/rest/v1/shifts?status=eq.available&order=date.asc`
    console.log('Fetching from:', url)
    
    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    console.log('Supabase response status:', res.status)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('Supabase error response:', errorText)
      return Response.json({ error: `Supabase error: ${res.status} - ${errorText}` }, { status: 500 })
    }

    const shifts = await res.json()
    console.log('Shifts fetched:', shifts.length)
    return Response.json(shifts)
  } catch (error) {
    console.error('Error fetching available shifts:', error)
    return Response.json({ error: `Exception: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}
