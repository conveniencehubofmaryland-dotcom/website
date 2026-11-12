/**
 * Headers for calling Supabase with any project key.
 * New keys (sb_publishable_... / sb_secret_...) go in the apikey header only.
 * Older JWT-style keys (eyJ...) also go in the Authorization header.
 */
export function keyHeaders(key: string, extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: key,
    ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
    ...extra,
  }
}

/** Headers using the service (secret) key. */
export function serviceHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return keyHeaders(process.env.SUPABASE_SERVICE_ROLE_KEY || '', extra)
}

/** Headers using the public (anon / publishable) key. */
export function anonHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return keyHeaders(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', extra)
}
