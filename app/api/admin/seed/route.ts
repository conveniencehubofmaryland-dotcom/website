import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbInsertAuth } from '@/lib/db'


const SERVICES = [
  {
    id: 'laundry', slug: 'laundry', sort_order: 1, active: true,
    title: 'Premium Laundry Pickup & Delivery',
    subtitle: 'Pickup · Wash · Dry · Fold · Deliver',
    description: 'We pick up, wash, dry, fold, and deliver directly to your doorstep. Monday–Saturday 9 AM–9 PM. 10 lb minimum order.',
    price_from: 'From $3.99/lb',
    pricing_details: [
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Colors',           price: '$3.99', unit: '/lb' },
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Bedding & Linens', price: '$4.99', unit: '/lb' },
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Whites',           price: '$6.99', unit: '/lb' },
      { section: 'Same Day Express Delivery',          label: 'Colors',           price: '$5.99', unit: '/lb' },
      { section: 'Same Day Express Delivery',          label: 'Bedding & Linens', price: '$6.99', unit: '/lb' },
      { section: 'Same Day Express Delivery',          label: 'Whites',           price: '$8.99', unit: '/lb' },
    ],
  },
  {
    id: 'cleaning', slug: 'cleaning', sort_order: 2, active: true,
    title: 'Professional Cleaning & Estate Care',
    subtitle: 'Residential · Commercial · Estate',
    description: 'Customized maintenance for residential estates, luxury apartments, and commercial operations. Market-adjusted for Virginia (NOVA), Maryland, and D.C. communities.',
    price_from: 'From $100/visit',
    pricing_details: [
      { section: 'Standard Residential Cleaning', label: 'Studio Apartment',      price: '$100–$150',  unit: 'per visit' },
      { section: 'Standard Residential Cleaning', label: '1 Bed / 1 Bath',        price: '$130–$200',  unit: 'per visit' },
      { section: 'Standard Residential Cleaning', label: '2 Bed / 2 Bath',        price: '$200–$250',  unit: 'per visit' },
      { section: 'Standard Residential Cleaning', label: '3 Bed / 2 Bath',        price: '$250–$350',  unit: 'per visit' },
      { section: 'Standard Residential Cleaning', label: '4+ Bed / Estate Scale', price: '$350–$450+', unit: 'per visit' },
      { section: 'Deep Cleaning Services',        label: 'Deep Clean Add-On',        price: '+$60–$110',  note: 'Added to standard baseline rate' },
      { section: 'Deep Cleaning Services',        label: 'Full One-Time Deep Clean', price: '$250–$450',  note: 'Based on sq footage & initial condition' },
      { section: 'Move-In / Move-Out Cleaning',   label: '1 Bedroom',    price: '$150–$250' },
      { section: 'Move-In / Move-Out Cleaning',   label: '2 Bedroom',    price: '$250–$350' },
      { section: 'Move-In / Move-Out Cleaning',   label: '3 Bedroom',    price: '$350–$450' },
      { section: 'Move-In / Move-Out Cleaning',   label: '4+ Bed / Luxury', price: '$380–$500+' },
      { section: 'Hourly & Recurring Estate Care', label: 'Shift ≤4 Hours',               price: '$54.99',           unit: '/hr' },
      { section: 'Hourly & Recurring Estate Care', label: 'Shift 5+ Hours',               price: '$49.99',           unit: '/hr' },
      { section: 'Hourly & Recurring Estate Care', label: 'Executive Residency Plan',     price: 'Custom Quote',     note: '5-day/week dedicated schedule' },
      { section: 'Hourly & Recurring Estate Care', label: 'Weekly / Bi-weekly / Monthly', price: 'Discounted Rates', note: 'Contact for custom quote' },
      { section: 'A La Carte Add-Ons', label: 'Inside Oven / Grill',          price: '$25–$45' },
      { section: 'A La Carte Add-Ons', label: 'Inside Refrigerator/Freezer',  price: '$25–$45' },
      { section: 'A La Carte Add-Ons', label: 'Interior Windows & Tracks',    price: '$35–$80' },
      { section: 'A La Carte Add-Ons', label: 'Heavy Pet Hair Removal',       price: '$20–$55' },
      { section: 'A La Carte Add-Ons', label: 'Post-Event Heavy Condition',   price: '$40–$90' },
    ],
  },
  {
    id: 'culinary', slug: 'culinary', sort_order: 3, active: true,
    title: 'Culinary, Housekeeping & Household Management',
    subtitle: 'Meal Prep · Tidying · Laundry · Errands',
    description: 'Complete estate support including light cooking, custom meal prep, tidying, daily laundry, errand running, and deep organizational overhauls. 6-hour minimum.',
    price_from: 'From $50/hr',
    pricing_details: [
      { section: 'Rates', label: 'Custom Hourly Rate',        price: '$50–$60',     unit: '/hr',   note: '6-hour minimum' },
      { section: 'Rates', label: '5-Day Specialized Support', price: 'Custom Quote',               note: 'Dedicated staff for total household ownership' },
      { section: 'Rates', label: 'Errands & Concierge',       price: '$0.725',      unit: '/mile', note: 'IRS standard business rate' },
    ],
  },
  {
    id: 'care', slug: 'care', sort_order: 4, active: true,
    title: 'Premium Nanny & Housekeeping Services',
    subtitle: 'Childcare · Companionship · Adult Care',
    description: 'Comprehensive childcare, companionship, and integrated household support. All personnel are strictly vetted — background-checked, CPR-certified, and fully vaccinated.',
    price_from: 'Custom Quote',
    pricing_details: [
      { section: 'Placement Packages', label: 'Nanny / Childcare',          price: 'Custom Quote', note: 'Tailored to family schedule & routines' },
      { section: 'Placement Packages', label: 'Companionship & Adult Care', price: 'Custom Quote', note: 'Background checked, CPR certified staff' },
    ],
  },
  {
    id: 'commercial', slug: 'commercial', sort_order: 5, active: true,
    title: 'Commercial Operations & Special Projects',
    subtitle: 'Offices · Retail · Warehouses · Post-Construction',
    description: 'Corporate offices, retail spaces, warehouses, and post-construction cleaning projects are custom-quoted per project scope.',
    price_from: 'Custom Quote',
    pricing_details: [
      { section: 'Billing Structure', label: 'All Commercial Work', price: 'Custom Quote', note: 'Quoted per project scope' },
    ],
  },
]

const DEALS = [
  { badge: 'Monday Deal',    headline: '$20 Flat — 10 lbs Colored Laundry',                detail: 'Economy 1-week turnaround delivery. Pay just $20 for 10 lbs of colored laundry — our lowest rate of the week.', sort_order: 1, active: true },
  { badge: 'Wednesday Deal', headline: '5% OFF for Nurses, Students & Expectant Mothers', detail: 'We appreciate healthcare workers, active students, and expectant mothers. Show valid ID to redeem 5% off premium services.', sort_order: 2, active: true },
  { badge: 'Weekend Deal',   headline: '3% OFF Bulk Laundry — 100+ lbs',                  detail: 'Scale up and save. Any laundry order of 100 lbs or more placed on Saturday receives 3% off automatically.', sort_order: 3, active: true },
  { badge: 'Members Only',   headline: 'FREE Signup + 2% Off All Recurring Services',     detail: 'Join the CHM network for free and lock in a permanent 2% discount on all recurring monthly service contracts. No expiry, no catches.', sort_order: 4, active: true },
]

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results: string[] = []
  let errors = 0

  for (const service of SERVICES) {
    const { error } = await dbInsertAuth('services', service, token)
    if (error) {
      results.push(`SKIP services/${service.id}: ${error}`)
      errors++
    } else {
      results.push(`OK   services/${service.id}`)
    }
  }

  for (const deal of DEALS) {
    const { error } = await dbInsertAuth('deals', deal, token)
    if (error) {
      results.push(`SKIP deals/${deal.badge}: ${error}`)
      errors++
    } else {
      results.push(`OK   deals/${deal.badge}`)
    }
  }

  return NextResponse.json({ results, errors, success: errors === 0 })
}
