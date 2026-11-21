import { getSessionMember } from '@/lib/member-session'
import { TIERS, tierOf } from '@/lib/membership-tiers'

// The member tier discount (Free 1.5%, Premium 3%) for the signed-in member in this browser, or 0.
// Only a member who has signed in to the member portal gets it.
export async function sessionMemberDiscountPercent(): Promise<number> {
  const member = await getSessionMember()
  if (!member) return 0
  return TIERS[tierOf(member.tier)].discountPercent
}
