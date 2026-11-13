import { svcSelect, svcInsert, svcPatch } from '@/lib/realtor'
import { isActiveMember } from '@/lib/membership'

// Member referral program: each active member has a personal code (CHM-M-XXXXXX).
// A friend who uses it gets 3% off their first service (applied on the quote).
// The member earns one $15 bonus in total, after the friend pays for a service.
// The bonus is redeemed only by an active member who shows proof, and is tracked in admin.

export const MEMBER_CODE_PREFIX = 'CHM-M-'
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const isMemberCode = (raw: string) => raw.trim().toUpperCase().startsWith(MEMBER_CODE_PREFIX)

export function newMemberCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return MEMBER_CODE_PREFIX + Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')
}

export type MemberReferralCheck =
  | { ok: true; code: string; referrerEmail: string; referrerName: string }
  | { ok: false; error: string }

// A friend types a member code: it must belong to an active member, and not be their own.
export async function checkMemberReferral(raw: string, friendEmail: string): Promise<MemberReferralCheck> {
  const code = raw.trim().toUpperCase()
  const rows = await svcSelect<{ name: string; email: string; active: boolean }>('members', {
    referral_code: `eq.${code}`,
    select: 'name,email,active',
    limit: '1',
  })
  const ref = rows[0]
  if (!ref || !ref.active) return { ok: false, error: 'That referral code is not valid.' }
  if ((ref.email || '').trim().toLowerCase() === (friendEmail || '').trim().toLowerCase()) {
    return { ok: false, error: 'You cannot use your own referral code.' }
  }
  return { ok: true, code, referrerEmail: ref.email, referrerName: ref.name }
}

// True when this member has already received their one bonus (earned or redeemed).
async function hasBonus(referrerEmail: string): Promise<boolean> {
  const rows = await svcSelect<{ id: string }>('member_referrals', {
    referrer_email: `eq.${referrerEmail.trim().toLowerCase()}`,
    status: 'in.(earned,redeemed)',
    select: 'id',
    limit: '1',
  })
  return rows.length > 0
}

// Called when a friend books with a member code. Creates a pending referral.
export async function recordPendingReferral(
  check: Extract<MemberReferralCheck, { ok: true }>,
  friend: { name: string; email: string; phone?: string | null },
  bookingLabel: string
): Promise<void> {
  const friendEmail = friend.email.trim().toLowerCase()
  if (!friendEmail) return
  const existing = await svcSelect<{ id: string }>('member_referrals', {
    referred_email: `eq.${friendEmail}`,
    select: 'id',
    limit: '1',
  })
  if (existing.length > 0) return
  const bonusGone = await hasBonus(check.referrerEmail)
  await svcInsert('member_referrals', {
    referrer_email: check.referrerEmail.trim().toLowerCase(),
    referrer_name: check.referrerName,
    referrer_code: check.code,
    referred_name: friend.name.trim(),
    referred_email: friendEmail,
    referred_phone: friend.phone?.trim() || null,
    status: bonusGone ? 'ineligible' : 'pending',
    booking_label: bookingLabel.slice(0, 200),
    note: bonusGone ? 'Referrer already received their one bonus' : null,
  })
}

// Called after the friend's payment succeeds. This is the proof: the Clover charge ID and amount.
export async function recordPaidReferral(
  check: Extract<MemberReferralCheck, { ok: true }>,
  friend: { name: string; email: string; phone?: string | null },
  proof: { chargeId: string; amount: number }
): Promise<void> {
  const friendEmail = friend.email.trim().toLowerCase()
  if (!friendEmail) return
  const existing = await svcSelect<{ id: string; status: string; referrer_email: string }>('member_referrals', {
    referred_email: `eq.${friendEmail}`,
    select: 'id,status,referrer_email',
    limit: '1',
  })
  const row = existing[0]
  if (row && row.status !== 'pending') return

  const referrerEmail = row ? row.referrer_email : check.referrerEmail.trim().toLowerCase()
  const eligible = !(await hasBonus(referrerEmail))
  const result = eligible
    ? { status: 'earned', earned_at: new Date().toISOString(), note: null }
    : { status: 'ineligible', earned_at: null, note: 'Referrer already received their one bonus' }
  const proofFields = { ...result, proof_charge_id: proof.chargeId, proof_amount: proof.amount }

  if (row) {
    await svcPatch('member_referrals', { id: `eq.${row.id}` }, proofFields)
    return
  }
  await svcInsert('member_referrals', {
    referrer_email: referrerEmail,
    referrer_name: check.referrerName,
    referrer_code: check.code,
    referred_name: friend.name.trim(),
    referred_email: friendEmail,
    referred_phone: friend.phone?.trim() || null,
    booking_label: 'Paid online',
    ...proofFields,
  })
}

// Admin redeems an earned bonus. The referrer must still be an active member.
export async function redeemReferral(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const rows = await svcSelect<{ id: string; status: string; referrer_email: string }>('member_referrals', {
    id: `eq.${id}`,
    select: 'id,status,referrer_email',
    limit: '1',
  })
  const row = rows[0]
  if (!row) return { ok: false, error: 'Referral not found.' }
  if (row.status !== 'earned') return { ok: false, error: 'Only earned referrals can be redeemed.' }
  if (!(await isActiveMember(row.referrer_email))) {
    return { ok: false, error: 'The referrer is no longer an active member, so this bonus cannot be redeemed.' }
  }
  const updated = await svcPatch('member_referrals', { id: `eq.${id}`, status: 'eq.earned' }, {
    status: 'redeemed',
    redeemed_at: new Date().toISOString(),
  })
  if (updated.length === 0) return { ok: false, error: 'This referral was already changed. Refresh and try again.' }
  return { ok: true }
}
