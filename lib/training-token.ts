import crypto from 'crypto'

// A training token proves the applicant entered the code emailed to them.
// It is signed on the server, expires after 12 hours, and is checked on every training request.
const LIFETIME_MS = 12 * 60 * 60 * 1000

function key(): string {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!k) throw new Error('Training token key is not configured')
  return k
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', key()).update(payload).digest('hex')
}

export function makeTrainingToken(email: string): string {
  const payload = `${email.trim().toLowerCase()}|${Date.now() + LIFETIME_MS}`
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`
}

// Returns the verified email, or null if the token is missing, forged, or expired.
export function verifyTrainingToken(token: string | null | undefined): string | null {
  if (!token) return null
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null
  const payload = Buffer.from(encoded, 'base64url').toString('utf8')
  const expected = sign(payload)
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  const [email, expires] = payload.split('|')
  if (!email || Number(expires) < Date.now()) return null
  return email
}
