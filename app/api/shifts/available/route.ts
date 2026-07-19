import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  try {
    const url = `${supabaseUrl}/rest/v1/shifts?status=eq.available&order=date.asc,start_time.asc`
    
    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[shifts] Supabase error:', res.status, errorText)
      return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 })
    }

    const shifts = await res.json()
    return NextResponse.json(shifts)
  } catch (error) {
    console.error('[shifts] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 })
  }
}
