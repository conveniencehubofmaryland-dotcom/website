import { dbSelect } from '@/lib/db'

// True when this email belongs to an active CHM member.
// Used by the quote and the card charge so both give the same member price.
export async function isActiveMember(email: string): Promise<boolean> {
  const wanted = (email || '').trim().toLowerCase()
  if (!wanted) return false
  try {
    const rows = await dbSelect<{ email: string }>('members', {
      email: `ilike.${wanted}`,
      active: 'eq.true',
      select: 'email',
    })
    return rows.some(r => (r.email || '').trim().toLowerCase() === wanted)
  } catch {
    return false
  }
}
