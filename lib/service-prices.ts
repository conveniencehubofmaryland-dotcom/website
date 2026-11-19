import { sbFetch } from '@/lib/shift-eligibility'
import type { PriceOverrides } from '@/lib/quote-pricing'

// Each quote price is linked to one row of the admin services table, by its exact section and label.
// Only rows whose price is a single amount (like "$120" or "+$17") are used. Ranges such as "$180–$240"
// and open prices such as "$600+" keep the built-in value in lib/quote-pricing.ts.
// If an admin renames a row, that quote price falls back to the built-in value until the link is updated.
const LINKS: { section: string; label: string; target: (ov: PriceOverrides, n: number) => void }[] = [
  { section: 'Standard Residential Cleaning', label: 'Studio (<500 sq ft)', target: (o, n) => ((o.standard ??= {}).studio = n) },
  { section: 'Standard Residential Cleaning', label: '1 Bedroom Apartment', target: (o, n) => ((o.standard ??= {})['1br'] = n) },
  { section: 'Standard Residential Cleaning', label: '2 Bedroom Home (500–1,200 sq ft)', target: (o, n) => ((o.standard ??= {})['2br'] = n) },
  { section: 'Standard Residential Cleaning', label: '3 Bedroom Home (1,200–1,800 sq ft)', target: (o, n) => ((o.standard ??= {})['3br'] = n) },
  { section: 'Standard Residential Cleaning', label: '4 Bedroom Home (1,800–2,500 sq ft)', target: (o, n) => ((o.standard ??= {})['4br'] = n) },
  { section: 'Deep Cleaning Services', label: 'Studio', target: (o, n) => ((o.deep ??= {}).studio = n) },
  { section: 'Deep Cleaning Services', label: '1 Bedroom', target: (o, n) => ((o.deep ??= {})['1br'] = n) },
  { section: 'Deep Cleaning Services', label: '2 Bedroom', target: (o, n) => ((o.deep ??= {})['2br'] = n) },
  { section: 'Deep Cleaning Services', label: '3 Bedroom', target: (o, n) => ((o.deep ??= {})['3br'] = n) },
  { section: 'Deep Cleaning Services', label: '4 Bedroom', target: (o, n) => ((o.deep ??= {})['4br'] = n) },
  { section: 'Deep Cleaning Services', label: '5+ Bedroom', target: (o, n) => ((o.deep ??= {})['5br+'] = n) },
  { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Colors', target: (o, n) => ((o.laundryPerLb ??= {}).colors = n) },
  { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Mixed Load', target: (o, n) => ((o.laundryPerLb ??= {}).mixed = n) },
  { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Bedding & Linens', target: (o, n) => ((o.laundryPerLb ??= {}).bedding = n) },
  { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Whites', target: (o, n) => ((o.laundryPerLb ??= {}).whites = n) },
  { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Wool & Sweaters', target: (o, n) => ((o.laundryPerLb ??= {}).wool = n) },
  { section: 'Standard Service (5–7 Business Day Turnaround)', label: 'Delicates', target: (o, n) => ((o.laundryPerLb ??= {}).delicates = n) },
  { section: 'Premium Add-Ons (Added to Base Rate)', label: 'Iron & Hang', target: (o, n) => ((o.laundryPremium ??= {}).ironhang = n) },
  { section: 'Premium Add-Ons (Added to Base Rate)', label: 'Express Iron & Press', target: (o, n) => ((o.laundryPremium ??= {}).expressiron = n) },
  { section: 'Folding Only', label: 'Pre-Washed Laundry', target: (o, n) => (o.laundryFolding = n) },
  { section: 'Monthly Subscription Plans', label: 'Light Load', target: (o, n) => ((o.laundryRecurring ??= {}).light = n) },
  { section: 'Monthly Subscription Plans', label: 'Standard Load', target: (o, n) => ((o.laundryRecurring ??= {}).standard = n) },
  { section: 'Monthly Subscription Plans', label: 'Premium Load', target: (o, n) => ((o.laundryRecurring ??= {}).premium = n) },
  { section: 'Monthly Subscription Plans', label: 'Unlimited Load', target: (o, n) => ((o.laundryRecurring ??= {}).unlimited = n) },
  { section: 'Specialty & Add-On Services', label: 'Allergen-Free Wash Cycle', target: (o, n) => ((o.laundryAddons ??= {}).allergenFree = n) },
  { section: 'Specialty & Add-On Services', label: 'Hypoallergenic Detergent', target: (o, n) => ((o.laundryAddons ??= {}).hypoallergenic = n) },
]

// Reads "$120", "+$17" or "$4.59" as a number. Anything else (ranges, "+", text) returns null.
function singleAmount(price: string): number | null {
  const cleaned = price.trim().replace(/^\+/, '').replace(/^\$/, '').replace(/,/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : null
}

// Builds the quote price overrides from the active admin services. Returns {} if the table cannot be read,
// so quotes keep their built-in prices rather than failing.
export async function loadServicePrices(): Promise<PriceOverrides> {
  const overrides: PriceOverrides = {}
  try {
    const res = await sbFetch('services?active=eq.true&select=pricing_details')
    if (!res.ok) return overrides
    const rows = (await res.json()) as { pricing_details: { section?: string; label?: string; price?: string }[] | null }[]
    for (const row of rows) {
      for (const item of row.pricing_details ?? []) {
        const link = LINKS.find(l => l.section === item.section && l.label === item.label)
        if (!link || !item.price) continue
        const n = singleAmount(item.price)
        if (n !== null) link.target(overrides, n)
      }
    }
  } catch (err) {
    console.error('[service-prices] could not read services; using built-in prices:', err)
  }
  return overrides
}
