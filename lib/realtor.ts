import { cookies } from 'next/headers'

// Server-side helpers for realtor partners and one-time referral codes.
// Uses the service role key, because these tables are closed to the public.

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const REALTOR_COOKIE = 'chm_realtor'
export const REFERRAL_DISCOUNT_NOTE = 'Realtor Referral Discount (15%)'

function svcHeaders(extra: Record<string, string> = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extra }
}

export async function svcSelect<T>(table: string, params: Record<string, string>): Promise<T[]> {
  try {
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${qs}`, { headers: svcHeaders() })
    if (!res.ok) return []
    return (await res.json()) as T[]
  } catch {
    return []
  }
}

export async function svcInsert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: svcHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  })
  const text = await res.text()
  if (!res.ok) return { ok: false as const, error: text }
  return { ok: true as const, rows: JSON.parse(text) as Record<string, unknown>[] }
}

export async function svcPatch(table: string, params: Record<string, string>, body: Record<string, unknown>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${qs}`, {
    method: 'PATCH',
    headers: svcHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(body),
  })
  if (!res.ok) return []
  return (await res.json()) as Record<string, unknown>[]
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function randomSixDigits(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000
  return String(n).padStart(6, '0')
}

export function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes))).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Format: CHM-XXXX-XXXX (no look-alike characters such as 0/O or 1/I)
export function makeReferralCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), b => alphabet[b % alphabet.length]).join('')
  return `CHM-${pick()}-${pick()}`
}

export type ReferralCheck =
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; error: string }

// Checks a code a buyer typed: must exist, be unused, and not be expired.
export async function checkReferralCode(raw: string): Promise<ReferralCheck> {
  const code = raw.trim().toUpperCase()
  const rows = await svcSelect<Record<string, unknown>>('referral_codes', { code: `eq.${code}`, select: '*', limit: '1' })
  const row = rows[0]
  if (!row) return { ok: false, error: 'That referral code is not valid.' }
  if (row.status !== 'unused') return { ok: false, error: 'That referral code has already been used.' }
  if (new Date(String(row.expires_at)).getTime() <= Date.now()) return { ok: false, error: 'That referral code has expired.' }
  return { ok: true, row }
}

// Marks a code as used. Returns false if it was already used or expired.
export async function consumeReferralCode(raw: string, bookingLabel: string): Promise<boolean> {
  const code = raw.trim().toUpperCase()
  const rows = await svcPatch(
    'referral_codes',
    { code: `eq.${code}`, status: 'eq.unused', expires_at: `gt.${new Date().toISOString()}`, select: '*' },
    { status: 'used', used_at: new Date().toISOString(), used_by_booking: bookingLabel.slice(0, 200) }
  )
  return rows.length > 0
}

// Returns the signed-in, approved realtor from the session cookie, or null.
export async function getSignedInRealtor() {
  const token = (await cookies()).get(REALTOR_COOKIE)?.value
  if (!token) return null
  const hash = await sha256Hex(token)
  const rows = await svcSelect<{ id: string; name: string; email: string; approved: boolean }>('realtors', {
    session_token_hash: `eq.${hash}`,
    session_expires_at: `gt.${new Date().toISOString()}`,
    approved: 'eq.true',
    select: 'id,name,email,approved',
    limit: '1',
  })
  return rows[0] ?? null
}

export async function sendEmail(payload: Record<string, unknown>) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('[realtor] email error:', e)
  }
}
