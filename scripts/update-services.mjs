import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

// Run with: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/update-services.mjs
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://pcahhxkajljhjpoploqz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: ws } }
)

const services = [
  {
    slug: 'laundry',
    title: 'Premium Laundry Pickup & Delivery',
    subtitle: 'We Pickup • Wash • Dry • Fold • Deliver',
    description: 'Regular 1–3 day turnaround or same-day express. Colors, bedding, and whites. Minimum 10 lbs. Mon–Sat 9 AM–9 PM.',
    price_from: 'From $3.99/lb',
    sort_order: 1,
    active: true,
    pricing_details: [
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Colors', price: '$3.99', unit: '/lb' },
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Bedding & Linens', price: '$4.99', unit: '/lb' },
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Whites', price: '$6.99', unit: '/lb' },
      { section: 'Same Day Express Delivery', label: 'Colors', price: '$5.99', unit: '/lb' },
      { section: 'Same Day Express Delivery', label: 'Bedding & Linens', price: '$6.99', unit: '/lb' },
      { section: 'Same Day Express Delivery', label: 'Whites', price: '$8.99', unit: '/lb' },
    ],
  },
  {
    slug: 'cleaning',
    title: 'Professional Cleaning & Estate Care',
    subtitle: 'Residential • Commercial • Move-In/Move-Out',
    description: 'Market-adjusted pricing for Virginia (NOVA), Maryland, and D.C. communities. Standard maintenance, deep cleaning, move-in/out turnovers, and hourly shifts.',
    price_from: 'From $100/visit',
    sort_order: 2,
    active: true,
    pricing_details: [
      { section: 'Standard Residential Cleaning', label: 'Studio Apartment', price: '$100–$150', unit: '/visit' },
      { section: 'Standard Residential Cleaning', label: '1 Bed / 1 Bath', price: '$130–$200', unit: '/visit' },
      { section: 'Standard Residential Cleaning', label: '2 Bed / 2 Bath', price: '$200–$250', unit: '/visit' },
      { section: 'Standard Residential Cleaning', label: '3 Bed / 2 Bath', price: '$250–$350', unit: '/visit' },
      { section: 'Standard Residential Cleaning', label: '4+ Bed / Estate Scale', price: '$350–$450+', unit: '/visit' },
      { section: 'Deep Cleaning', label: 'Deep Clean Add-On', price: '+$60–$110', unit: '', note: 'Added to standard baseline rate' },
      { section: 'Deep Cleaning', label: 'Full One-Time Deep Clean', price: '$250–$450', unit: '', note: 'Based on sq. footage & initial condition' },
      { section: 'Move-In / Move-Out Cleaning', label: '1 Bedroom', price: '$150–$250', unit: '/visit' },
      { section: 'Move-In / Move-Out Cleaning', label: '2 Bedroom', price: '$250–$350', unit: '/visit' },
      { section: 'Move-In / Move-Out Cleaning', label: '3 Bedroom', price: '$350–$450', unit: '/visit' },
      { section: 'Move-In / Move-Out Cleaning', label: '4+ Bed / Luxury', price: '$380–$500+', unit: '/visit' },
      { section: 'Hourly & Recurring', label: 'Individual Shift (≤ 4 hrs)', price: '$54.99', unit: '/hr' },
      { section: 'Hourly & Recurring', label: 'Individual Shift (5+ hrs)', price: '$49.99', unit: '/hr' },
      { section: 'Hourly & Recurring', label: 'Weekly / Bi-weekly / Monthly', price: 'Discounted', unit: '', note: 'Contact us for a custom plan' },
      { section: 'Hourly & Recurring', label: 'Executive Residency Plan', price: 'Custom Quote', unit: '', note: '5-day/week dedicated staff' },
      { section: 'À La Carte Add-Ons', label: 'Inside Oven / Grill', price: '$25–$45' },
      { section: 'À La Carte Add-Ons', label: 'Inside Refrigerator / Freezer', price: '$25–$45' },
      { section: 'À La Carte Add-Ons', label: 'Interior Windows & Tracks', price: '$35–$80' },
      { section: 'À La Carte Add-Ons', label: 'Heavy Pet Hair Removal', price: '$20–$55' },
      { section: 'À La Carte Add-Ons', label: 'Post-Event / Heavy Condition', price: '$40–$90' },
    ],
  },
  {
    slug: 'culinary',
    title: 'Culinary, Housekeeping & Household Management',
    subtitle: '6-Hour Minimum',
    description: 'Complete estate support: light cooking, custom meal prep, tidying, daily laundry, errand running, and deep organizational overhauls. Final rate negotiable based on estate square footage and complex task requirements.',
    price_from: 'From $50/hr',
    sort_order: 3,
    active: true,
    pricing_details: [
      { label: 'Custom Hourly Rate', price: '$50–$60', unit: '/hr', note: '6-hour minimum. Negotiable based on estate size & tasks' },
      { label: '5-Day Specialized Support', price: 'Custom Quote', unit: '', note: 'Dedicated staff for total household ownership & daily continuity' },
      { label: 'Errands & Concierge', price: '$0.725', unit: '/mile', note: 'Shopping, grocery runs & appointment management' },
    ],
  },
  {
    slug: 'care',
    title: 'Premium Nanny & Housekeeping Services',
    subtitle: 'Adult & Child Care • Companionship',
    description: 'Comprehensive childcare, companionship, and integrated household support. Customized placement packages tailored to family schedules and specialized care needs. All personnel are strictly vetted.',
    price_from: 'Inquire for rates',
    sort_order: 4,
    active: true,
    pricing_details: [
      { label: 'Customized Care Packages', price: 'Custom Quote', unit: '', note: 'Tailored to family schedules, routines, and specialized child or adult care needs' },
    ],
  },
  {
    slug: 'commercial',
    title: 'Commercial Operations & Special Projects',
    subtitle: 'Offices • Retail • Warehouses • Post-Construction',
    description: 'Corporate offices, retail spaces, warehouses, and post-construction cleaning projects are custom-quoted per project scope. Commercial execution models typically operate within a 60%–80% project value structure.',
    price_from: 'Custom Quote',
    sort_order: 5,
    active: true,
    pricing_details: [
      { label: 'Corporate Offices & Retail', price: 'Custom Quote', unit: '', note: 'Quoted per project scope' },
      { label: 'Warehouses & Post-Construction', price: 'Custom Quote', unit: '', note: '60%–80% project value structure' },
    ],
  },
]

const deals = [
  {
    badge: 'Every Monday',
    headline: '$20 Flat Laundry Special',
    detail: '$20 flat rate for 10 lbs of colored laundry — economy 1-week turnaround delivery.',
    sort_order: 1,
    active: true,
  },
  {
    badge: 'Every Wednesday',
    headline: '5% OFF — Healthcare, Students & Expectant Mothers',
    detail: '5% OFF all premium services for healthcare workers/nurses, active students, and expectant mothers.',
    sort_order: 2,
    active: true,
  },
  {
    badge: 'Sat & Sun',
    headline: '3% OFF Bulk Laundry Orders',
    detail: 'Save 3% on laundry orders of 100+ lbs every Saturday and Sunday.',
    sort_order: 3,
    active: true,
  },
  {
    badge: 'Ongoing',
    headline: 'FREE Membership + 2% OFF Always',
    detail: 'Free network signup + 2% locked-in discount on all recurring monthly contracts. No expiry, no catches.',
    sort_order: 4,
    active: true,
  },
]

// Update or insert services
for (const svc of services) {
  const { error } = await supabase
    .from('services')
    .upsert(svc, { onConflict: 'slug' })
  if (error) {
    console.error(`Error upserting service ${svc.slug}:`, error.message)
  } else {
    console.log(`✓ Service: ${svc.title}`)
  }
}

// Update deals — delete all and re-insert for clean slate
const { error: delError } = await supabase.from('deals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
if (delError) console.error('Error deleting deals:', delError.message)

for (const deal of deals) {
  const { error } = await supabase.from('deals').insert(deal)
  if (error) {
    console.error(`Error inserting deal "${deal.headline}":`, error.message)
  } else {
    console.log(`✓ Deal: ${deal.headline}`)
  }
}

console.log('\nDone.')
