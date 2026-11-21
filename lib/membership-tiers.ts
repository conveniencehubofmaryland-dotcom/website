// Member tiers. Keep these in step with the membership signup and the member portal.
export type MemberTier = 'free' | 'premium'

export const TIERS: Record<MemberTier, { name: string; discountPercent: number; benefits: string[]; price: string }> = {
  free: {
    name: 'Free Membership',
    discountPercent: 1.5,
    price: 'No fees, cancel anytime',
    benefits: [
      'Access to member-only deals',
      'No fees, cancel anytime',
      'Must sign up for recurring services',
      '1.5% off all services',
    ],
  },
  premium: {
    name: 'Premium Membership',
    discountPercent: 3,
    price: '$15 a month or $120 a year',
    benefits: [
      'All Free membership benefits',
      'Priority scheduling',
      '3% off all services',
      'Must sign up for recurring services',
      '$120 annually or $15 monthly',
    ],
  },
}

export function tierOf(value: string | null | undefined): MemberTier {
  return value === 'premium' ? 'premium' : 'free'
}

// Premium is paid by card: $15 each month, or $120 each year.
export type PremiumBilling = 'monthly' | 'annual'
export const PREMIUM_PRICE: Record<PremiumBilling, number> = { monthly: 15, annual: 120 }
export const PREMIUM_BILLING: PremiumBilling[] = ['monthly', 'annual']
