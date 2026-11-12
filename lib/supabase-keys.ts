/**
 * Headers for calling Supabase with the service key.
 * New keys (sb_secret_...) go in the apikey header only.
 * Older JWT-style keys (eyJ...) also go in the Authorization header.
 */
export function serviceHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return {
    apikey: key,
    ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
    ...extra,
  }
}
