/**
 * Lightweight Supabase REST client using fetch.
 * Replaces @supabase/supabase-js for reads to keep edge bundle under 3 MB.
 */

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
}

const serviceHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
}

export async function dbSelect<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  if (!URL || !KEY) return []
  try {
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`${URL}/rest/v1/${table}${qs ? '?' + qs : ''}`, { headers })
    if (!res.ok) return []
    return res.json() as Promise<T[]>
  } catch {
    return []
  }
}

export async function dbSelectAuth<T>(
  table: string,
  token: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  if (!token || !URL || !KEY) return []
  try {
    const qs  = new URLSearchParams(params).toString()
    const res = await fetch(`${URL}/rest/v1/${table}${qs ? '?' + qs : ''}`, {
      headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    if (!res.ok) return []
    return res.json() as Promise<T[]>
  } catch {
    return []
  }
}

export async function dbPatchAuth(
  table: string,
  id: string,
  patch: Record<string, unknown>,
  token: string
): Promise<{ error: string | null }> {
  if (!token) return { error: 'Unauthorized' }
  const res = await fetch(`${URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const body = await res.text()
    return { error: body }
  }
  return { error: null }
}

export async function dbInsertAuth(
  table: string,
  row: Record<string, unknown>,
  token: string
): Promise<{ error: string | null }> {
  if (!URL || !KEY) return { error: 'Database not configured' }
  if (!token) return { error: 'Unauthorized' }
  try {
    const res = await fetch(`${URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    })
    if (!res.ok) {
      const body = await res.text()
      return { error: body }
    }
    return { error: null }
  } catch {
    return { error: 'Failed to connect to database' }
  }
}

export async function dbInsertService(
  table: string,
  row: Record<string, unknown>
): Promise<{ error: string | null }> {
  if (!URL || !SERVICE_KEY) return { error: 'Database not configured' }
  try {
    const res = await fetch(`${URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        ...serviceHeaders,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    })
    if (!res.ok) {
      const body = await res.text()
      return { error: body }
    }
    return { error: null }
  } catch {
    return { error: 'Failed to connect to database' }
  }
}

export async function dbDeleteAuth(
  table: string,
  id: string,
  token: string
): Promise<{ error: string | null }> {
  if (!URL || !KEY) return { error: 'Database not configured' }
  if (!token) return { error: 'Unauthorized' }
  const res = await fetch(`${URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    return { error: body }
  }
  return { error: null }
}

export async function dbDeleteService(
  table: string,
  id: string
): Promise<{ error: string | null }> {
  if (!URL || !SERVICE_KEY) return { error: 'Database not configured' }
  const res = await fetch(`${URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: serviceHeaders,
  })
  if (!res.ok) {
    const body = await res.text()
    return { error: body }
  }
  return { error: null }
}

export async function dbInsert(table: string, row: Record<string, unknown>): Promise<{ error: string | null }> {
  if (!URL || !KEY) return { error: 'Database not configured' }
  try {
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
  } catch {
    return { error: 'Failed to connect to database' }
  }
}
