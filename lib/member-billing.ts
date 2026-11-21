import { nextChargeDate } from '@/lib/recurring'
import type { PremiumBilling } from '@/lib/membership-tiers'

// The next Premium charge date (YYYY-MM-DD) after `from`: one month or one year later.
export function nextPremiumDate(from: string, billing: PremiumBilling): string {
  if (billing === 'monthly') return nextChargeDate(from, 'monthly')
  const d = new Date(`${from}T12:00:00Z`)
  d.setUTCFullYear(d.getUTCFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export function premiumPeriodLabel(billing: PremiumBilling): string {
  return billing === 'monthly' ? 'month' : 'year'
}
