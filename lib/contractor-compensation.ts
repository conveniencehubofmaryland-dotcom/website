// lib/contractor-compensation.ts
// Source: CHM Contractor Compensation Structure, effective October 22, 2026.
// NOT APPROVED FOR USE YET. Do not show these values to staff until the
// CPA / employment attorney review is complete.

export type ResidentialTierKey = 'BLUE' | 'PRIORITY' | 'XL' | 'ELITE'

export const RESIDENTIAL_TIERS: Record<
  ResidentialTierKey,
  { label: string; providerShare: number; chmShare: number; appliesTo: string[] }
> = {
  BLUE: {
    label: 'CHM BLUE',
    providerShare: 0.57,
    chmShare: 0.43,
    appliesTo: ['Cleaning (one-time and monthly)', 'Laundry Handling'],
  },
  PRIORITY: {
    label: 'CHM PRIORITY',
    providerShare: 0.59,
    chmShare: 0.41,
    appliesTo: ['Cleaning (bi-weekly and weekly)', 'Culinary'],
  },
  XL: {
    label: 'CHM XL',
    providerShare: 0.61,
    chmShare: 0.39,
    appliesTo: ['Nanny / Childcare', 'Care Companion (Elderly)', 'Regular Housekeeping'],
  },
  ELITE: {
    label: 'CHM ELITE',
    providerShare: 0.67,
    chmShare: 0.33,
    appliesTo: ['Live-in Housekeeping', 'Multi-skilled Assignments'],
  },
}

// CHM fee on commercial contracts, by monthly contract value (ascending).
// Assumption: a value exactly on a boundary uses the higher band
// ($1,000 = 25%, $3,000 = 30%, $7,500 = 35%). Confirm before launch.
export const COMMERCIAL_CHM_FEE_BANDS = [
  { minMonthly: 500, chmFee: 0.2 },   // $500 to $999.99
  { minMonthly: 1000, chmFee: 0.25 }, // $1,000 to $2,999.99
  { minMonthly: 3000, chmFee: 0.3 },  // $3,000 to $7,499.99
  { minMonthly: 7500, chmFee: 0.35 }, // $7,500 and above
]

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Splits one residential service fee between the contractor and CHM.
export function splitResidentialFee(clientFee: number, tier: ResidentialTierKey) {
  const contractor = round2(clientFee * RESIDENTIAL_TIERS[tier].providerShare)
  const chm = round2(clientFee - contractor)
  return { contractor, chm }
}

// Returns CHM's fee rate for a monthly commercial contract, or null if under $500.
export function getCommercialChmFeeRate(monthlyContract: number): number | null {
  let rate: number | null = null
  for (const band of COMMERCIAL_CHM_FEE_BANDS) {
    if (monthlyContract >= band.minMonthly) rate = band.chmFee
  }
  return rate
}

// Splits a monthly commercial contract between CHM and the contractor.
export function splitCommercialContract(monthlyContract: number) {
  const chmRate = getCommercialChmFeeRate(monthlyContract)
  if (chmRate === null) return null
  const chm = round2(monthlyContract * chmRate)
  const contractor = round2(monthlyContract - chm)
  return { chmRate, chm, contractor }
}
