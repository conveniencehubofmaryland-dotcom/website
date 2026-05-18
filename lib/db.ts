/**
 * Lightweight Supabase REST client using fetch.
 * Replaces @supabase/supabase-js for reads to keep edge bundle under 3 MB.
 */

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
}

export async function dbSelect<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${URL}/rest/v1/${table}${qs ? '?' + qs : ''}`, { headers })
  if (!res.ok) return []
  return res.json() as Promise<T[]>
}

export async function dbInsert(table: string, row: Record<string, unknown>): Promise<{ error: string | null }> {
  const res = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  })
  if (!res.ok) {
    const body = await res.text()
    return { error: body }
  }
  return { error: null }
}
