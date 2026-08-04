import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'

const TAX_RATE = 0.06

const STANDARD_CLEANING: Record<string, number> = {
  studio: 100, '1br': 150, '2br': 250, '3br': 350, '4br': 450, '5br+': 500,
}
const DEEP_CLEANING: Record<string, number> = {
  studio: 250, '1br': 300, '2br': 350, '3br': 450, '4br': 600, '5br+': 750,
}
const MOVEINOUT: Record<string, { good: number; poor: number }> = {
  '1br': { good: 450, poor: 600 },
  '3br': { good: 600, poor: 900 },
  '4br': { good: 800, poor: 1200 },
  '5br': { good: 950, poor: 1350 },
}
const FREQUENCY_DISCOUNT: Record<string, number> = {
  onetime: 0, monthly: 0.10, biweekly: 0.10, weekly: 0.15, twiceweekly: 0.15,
}
const PET_FEE: Record<string, number> = { '0': 0, '1': 27.5, '2': 50, '3+': 80 }
const ADDON_PRICES: Record<string, number> = {
  carpet: 175, windowInt: 97.5, windowExt: 175, appliance: 112.5,
  grout: 212.5, petOdor: 137.5, disinfect: 75,
}
const FIRST_TIME_DISCOUNT = 0.15
const SITE_URL = 'https://conveniencehubofmaryland.com'

const LAUNDRY_PER_LB: Record<string, number> = {
  colors: 3.99, mixed: 4.99, bedding: 4.99, whites: 6.99, wool: 7.99, delicates: 8.99,
}
const LAUNDRY_PREMIUM_PER_LB: Record<string, number> = {
  none: 0, ironhang: 2.00, expressiron: 4.00, samedayexpress: 1.75,
}
const LAUNDRY_FOLDING_RATE = 1.50
const LAUNDRY_RECURRING: Record<string, number> = {
  light: 140, standard: 250, premium: 350, unlimited: 500,
}
const LAUNDRY_ADDON_PRICES: Record<string, number> = {
  stainRemoval: 15, allergenFree: 15, hypoallergenic: 10,
  comforter: 40, beddingSet: 50, curtainPanels: 3.5, tablecloths: 20,
}
const MEALPREP_PLANS: Record<string, number> = {
  starter: 350, standard: 675, premium: 975, luxury: 1350,
}
const CULINARY_HOURLY: Record<string, { rate: number; minHrs: number }> = {
  personalchef: { rate: 90, minHrs: 3 },
  eventcatering: { rate: 87.5, minHrs: 4 },
  kitchencoaching: { rate: 105, minHrs: 2 },
}
const CULINARY_SPECIALTY_PER_SERVING: Record<string, number> = {
  breakfast: 10, lunch: 12.5, dinner: 16, dessert: 9,
}
const CULINARY_GROCERY: Record<string, number> = {
  basic: 40, premium: 62.5,
}
const CULINARY_DIETARY_PCT: Record<string, number> = {
  glutenfree: 0.175, vegan: 0.10, keto: 0.175,
}
// Nanny / Childcare
const NANNY_MONTHLY: Record<string, { cost: number; avgWeeklyHrs: number }> = {
  parttime: { cost: 2800, avgWeeklyHrs: 17.5 },
  standard: { cost: 5550, avgWeeklyHrs: 32.5 },
  premium:  { cost: 8600, avgWeeklyHrs: 40 },
}
const NANNY_HOURLY: Record<string, { rate: number; minHrs: number }> = {
  babysitting: { rate: 40, minHrs: 2 },
  overnight: { rate: 35, minHrs: 8 },
  nannyhousekeeping: { rate: 40, minHrs: 3 },
  event: { rate: 35, minHrs: 2 },
}
const NANNY_SPECIALIZED_PER_HR: Record<string, number> = {
  infant: 4, specialneeds: 6.5, bilingual: 5,
}
const NANNY_EXTRA_CHILD_PER_HR = 3.5
const NANNY_WEEKEND_PER_HR = 4
const NANNY_HOLIDAY_MULTIPLIER = 0.375

// Elder / Companion Care
const CARE_MONTHLY: Record<string, { cost: number; avgWeeklyHrs: number }> = {
  light: { cost: 900, avgWeeklyHrs: 9 },
  standard: { cost: 2375, avgWeeklyHrs: 22.5 },
  fulltime: { cost: 5000, avgWeeklyHrs: 40 },
  '24hour': { cost: 10000, avgWeeklyHrs: 168 },
}
const CARE_HOURLY: Record<string, { rate: number; minHrs: number }> = {
  companion: { rate: 35, minHrs: 2 },
  personalcare: { rate: 35, minHrs: 3 },
  postrecovery: { rate: 35, minHrs: 4 },
  respite: { rate: 35, minHrs: 4 },
  overnight: { rate: 35, minHrs: 8 },
}
const CARE_SPECIALIZED_PER_HR: Record<string, number> = {
  dementia: 6, postsurgical: 7.5, mobility: 4.5, medication: 3,
}
const CARE_DAY_PROGRAM: Record<string, number> = {
  social: 350, wellness: 500, fullservice: 675,
}

type Selections = Record<string, unknown>
type LineItem = { label: string; amount: number }

function calcCleaning(sel: Selections): { total: number; breakdown: LineItem[] } {
  const breakdown: LineItem[] = []
  let base = 0
  const serviceType = sel.serviceType as string

  if (serviceType === 'moveinout') {
    const moveSize = sel.moveSize as string
    const condition = sel.moveCondition as 'good' | 'poor'
    const sizeTable = MOVEINOUT[moveSize]
    base = sizeTable ? sizeTable[condition] || 0 : 0
    breakdown.push({ label: `Move-In/Move-Out (${moveSize}, ${condition})`, amount: base })
  } else {
    const table = serviceType === 'deep' ? DEEP_CLEANING : STANDARD_CLEANING
    const homeSize = sel.homeSize as string
    base = table[homeSize] || 0
    breakdown.push({ label: `${serviceType === 'deep' ? 'Deep' : 'Standard'} Cleaning (${homeSize})`, amount: base })

    if (serviceType === 'standard' && sel.firstTime) {
      const discountAmt = base * FIRST_TIME_DISCOUNT
      breakdown.push({ label: 'First-Time Customer Discount (15%)', amount: -discountAmt })
      base = base - discountAmt
    }

    const discount = FREQUENCY_DISCOUNT[sel.frequency as string] ?? 0
    if (discount > 0) {
      const discountAmt = base * discount
      breakdown.push({ label: `Recurring Discount (${Math.round(discount * 100)}%)`, amount: -discountAmt })
      base = base - discountAmt
    }
  }

  if (Array.isArray(sel.addOns)) {
    for (const a of sel.addOns as string[]) {
      const price = ADDON_PRICES[a] || 0
      if (price > 0) breakdown.push({ label: `Add-On: ${a}`, amount: price })
    }
  }

  const petFee = PET_FEE[sel.pets as string] || 0
  if (petFee > 0) breakdown.push({ label: 'Pet Fee', amount: petFee })

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0)
  return { total, breakdown }
}

function calcLaundry(sel: Selections): { total: number; breakdown: LineItem[] } {
  const breakdown: LineItem[] = []
  const planType = sel.planType as string
  let total = 0

  if (planType === 'recurring') {
    const cost = LAUNDRY_RECURRING[sel.recurringPlan as string] || 0
    breakdown.push({ label: `Monthly Subscription (${sel.recurringPlan})`, amount: cost })
    total = cost
  } else if (planType === 'foldingOnly') {
    const weight = Math.max(10, Number(sel.weight) || 10)
    const cost = LAUNDRY_FOLDING_RATE * weight
    breakdown.push({ label: `Folding Only — ${weight} lbs @ $1.50/lb`, amount: cost })
    total = cost
  } else {
    // per-pound standard service
    const category = sel.category as string
    const weight = Math.max(10, Number(sel.weight) || 10)
    const rate = LAUNDRY_PER_LB[category] || 0
    const base = rate * weight
    breakdown.push({ label: `${category} — ${weight} lbs @ $${rate.toFixed(2)}/lb`, amount: base })
    total = base

    const premium = sel.premiumOption as string
    if (premium && premium !== 'none') {
      const premRate = LAUNDRY_PREMIUM_PER_LB[premium] || 0
      const premCost = premRate * weight
      const premLabels: Record<string, string> = {
        ironhang: 'Iron & Hang', expressiron: 'Express Iron & Press', samedayexpress: 'Same-Day Express',
      }
      breakdown.push({ label: `${premLabels[premium]} (+$${premRate.toFixed(2)}/lb)`, amount: premCost })
      total += premCost
    }
  }

  // Specialty add-ons (apply to any plan type)
  const addOnQty = (sel.addOnQty || {}) as Record<string, number>
  for (const [key, price] of Object.entries(LAUNDRY_ADDON_PRICES)) {
    const qty = Number(addOnQty[key]) || 0
    if (qty > 0) {
      const addonLabels: Record<string, string> = {
        stainRemoval: 'Stain Removal Treatment', allergenFree: 'Allergen-Free Wash Cycle',
        hypoallergenic: 'Hypoallergenic Detergent', comforter: 'Comforter/Duvet Cleaning',
        beddingSet: 'Bedding Set', curtainPanels: 'Curtain Panels', tablecloths: 'Tablecloths',
      }
      const cost = price * qty
      breakdown.push({ label: `${addonLabels[key]} × ${qty}`, amount: cost })
      total += cost
    }
  }

  return { total, breakdown }
}
function calcMealPrep(sel: Selections): { total: number; breakdown: LineItem[] } {
  const breakdown: LineItem[] = []
  const mode = sel.mode as string || 'monthly'
  let total = 0

  if (mode === 'hourly') {
    const opt = CULINARY_HOURLY[sel.subtype as string]
    if (opt) {
      const hrs = Math.max(opt.minHrs, Number(sel.hours) || opt.minHrs)
      const labels: Record<string, string> = { personalchef: 'Personal Chef / Meal Prep', eventcatering: 'Special Event Catering Prep', kitchencoaching: 'Kitchen Coaching & Training' }
      const cost = opt.rate * hrs
      breakdown.push({ label: `${labels[sel.subtype as string]} — ${hrs} hrs @ $${opt.rate}/hr`, amount: cost })
      total = cost
    }
  } else if (mode === 'specialty') {
    const qty = (sel.specialtyQty || {}) as Record<string, number>
    const labels: Record<string, string> = { breakfast: 'Breakfast Prep', lunch: 'Lunch Pack', dinner: 'Dinner Entrée', dessert: 'Dessert/Baked Goods' }
    for (const [key, price] of Object.entries(CULINARY_SPECIALTY_PER_SERVING)) {
      const n = Number(qty[key]) || 0
      if (n > 0) {
        const cost = price * n
        breakdown.push({ label: `${labels[key]} × ${n} servings`, amount: cost })
        total += cost
      }
    }
  } else if (mode === 'grocery') {
    const service = sel.grocerySubtype as string
    const visits = Math.max(1, Number(sel.groceryVisits) || 1)
    const rate = CULINARY_GROCERY[service] || 0
    const cost = rate * visits
    const labels: Record<string, string> = { basic: 'Basic Grocery Shopping', premium: 'Premium Sourcing (Specialty/Organic)' }
    breakdown.push({ label: `${labels[service]} × ${visits} visit(s)`, amount: cost })
    total = cost
  } else {
    const cost = MEALPREP_PLANS[sel.planTier as string] || 0
    breakdown.push({ label: `Meal Prep Plan (${sel.planTier})`, amount: cost })
    total = cost
  }

  if ((mode === 'monthly' || mode === 'specialty') && Array.isArray(sel.dietary)) {
    const dietaryLabels: Record<string, string> = { glutenfree: 'Gluten-Free (+17.5%)', vegan: 'Vegan/Vegetarian (+10%)', keto: 'Keto/Low-Carb (+17.5%)' }
    for (const d of sel.dietary as string[]) {
      const pct = CULINARY_DIETARY_PCT[d]
      if (pct) {
        const cost = total * pct
        breakdown.push({ label: dietaryLabels[d], amount: cost })
        total += cost
      }
    }
  }

  return { total, breakdown }
}
function calcNanny(sel: Selections): { total: number; breakdown: LineItem[] } {
  const breakdown: LineItem[] = []
  const mode = sel.mode as string
  let total = 0
  let effectiveHrs = 0

  if (mode === 'monthly') {
    const tier = NANNY_MONTHLY[sel.tier as string]
    if (tier) {
      breakdown.push({ label: `${sel.tier} Nanny (Monthly)`, amount: tier.cost })
      total = tier.cost
      effectiveHrs = tier.avgWeeklyHrs * 4.33
    }
  } else {
    const opt = NANNY_HOURLY[sel.subtype as string]
    if (opt) {
      const hrs = Math.max(opt.minHrs, Number(sel.hours) || opt.minHrs)
      const base = opt.rate * hrs
      breakdown.push({ label: `${sel.subtype} — ${hrs} hrs @ $${opt.rate}/hr`, amount: base })
      total = base
      effectiveHrs = hrs
    }
  }

  const extraChildren = Number(sel.extraChildren) || 0
  if (extraChildren > 0 && effectiveHrs > 0) {
    const cost = extraChildren * NANNY_EXTRA_CHILD_PER_HR * effectiveHrs
    breakdown.push({ label: `${extraChildren} Additional Child(ren)`, amount: cost })
    total += cost
  }

  if (Array.isArray(sel.specialized)) {
    for (const s of sel.specialized as string[]) {
      const perHr = NANNY_SPECIALIZED_PER_HR[s]
      if (perHr && effectiveHrs > 0) {
        const cost = perHr * effectiveHrs
        const labels: Record<string, string> = { infant: 'Infant Care Specialist', specialneeds: 'Special Needs Care', bilingual: 'Bilingual Nanny' }
        breakdown.push({ label: labels[s], amount: cost })
        total += cost
      }
    }
  }

  if (sel.weekend && mode === 'hourly' && effectiveHrs > 0) {
    const cost = NANNY_WEEKEND_PER_HR * effectiveHrs
    breakdown.push({ label: 'Weekend/Evening Rate', amount: cost })
    total += cost
  }

  if (sel.holiday && mode === 'hourly') {
    const cost = total * NANNY_HOLIDAY_MULTIPLIER
    breakdown.push({ label: 'Holiday Rate (+37.5%)', amount: cost })
    total += cost
  }

  return { total, breakdown }
}

function calcElderCare(sel: Selections): { total: number; breakdown: LineItem[] } {
  const breakdown: LineItem[] = []
  const mode = sel.mode as string
  let total = 0
  let effectiveHrs = 0

  if (mode === 'monthly') {
    const tier = CARE_MONTHLY[sel.tier as string]
    if (tier) {
      const label = sel.tier === '24hour' ? '24-Hour Care (Monthly)' : `${sel.tier} Companion Care (Monthly)`
      breakdown.push({ label, amount: tier.cost })
      total = tier.cost
      effectiveHrs = tier.avgWeeklyHrs * 4.33
    }
  } else if (mode === 'dayprogram') {
    const weekly = CARE_DAY_PROGRAM[sel.tier as string] || 0
    breakdown.push({ label: `Adult Day Program (${sel.tier}) — Weekly`, amount: weekly })
    total = weekly
  } else {
    const opt = CARE_HOURLY[sel.subtype as string]
    if (opt) {
      const hrs = Math.max(opt.minHrs, Number(sel.hours) || opt.minHrs)
      const base = opt.rate * hrs
      breakdown.push({ label: `${sel.subtype} — ${hrs} hrs @ $${opt.rate}/hr`, amount: base })
      total = base
      effectiveHrs = hrs
    }
  }

  if (Array.isArray(sel.specialized)) {
    for (const s of sel.specialized as string[]) {
      const perHr = CARE_SPECIALIZED_PER_HR[s]
      if (perHr && effectiveHrs > 0) {
        const cost = perHr * effectiveHrs
        const labels: Record<string, string> = { dementia: "Dementia/Alzheimer's Care", postsurgical: 'Post-Surgical Recovery Support', mobility: 'Mobility & Physical Assistance', medication: 'Medication Management' }
        breakdown.push({ label: labels[s], amount: cost })
        total += cost
      }
    }
  }

  return { total, breakdown }
}

function bookNowUrl(category: string, name: string, email: string, phone: string): string {
  const serviceMap: Record<string, string> = {
    cleaning: 'cleaning',
    laundry: 'laundry',
    mealprep: 'culinary',
    nanny: 'care',
    eldercare: 'care',
    commercial: 'commercial',
    special: 'care',
  }
  const params = new URLSearchParams({
    name, email, phone,
    service: serviceMap[category] || '',
  })
  return `${SITE_URL}/book?${params.toString()}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, category, selections, honeypot } = body

    // Spam protection: honeypot field should always be empty for real users
    if (honeypot) {
      return NextResponse.json({ success: true }) // silently pretend success to bots
    }

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let subtotal: number | null = null
    let tax: number | null = null
    let total: number | null = null
    let deposit: number | null = null
    let breakdown: LineItem[] = []

    if (category === 'cleaning') {
      const r = calcCleaning(selections || {})
      subtotal = r.total
      breakdown = r.breakdown
    } else if (category === 'laundry') {
      const r = calcLaundry(selections || {})
      subtotal = r.total
      breakdown = r.breakdown
    } else if (category === 'mealprep') {
      const r = calcMealPrep(selections || {})
      subtotal = r.total
      breakdown = r.breakdown
    } else if (category === 'nanny') {
      const r = calcNanny(selections || {})
      subtotal = r.total
      breakdown = r.breakdown
    } else if (category === 'eldercare') {
      const r = calcElderCare(selections || {})
      subtotal = r.total
      breakdown = r.breakdown
    }

    if (subtotal !== null) {
      subtotal = Math.round(subtotal * 100) / 100
      tax = Math.round(subtotal * TAX_RATE * 100) / 100
      total = Math.round((subtotal + tax) * 100) / 100
      deposit = Math.round(total * 0.30 * 100) / 100
    }

    const { error: dbError } = await dbInsertService('quote_requests', {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      category,
      selections: { ...selections, breakdown },
      estimated_subtotal: subtotal,
      estimated_tax: tax,
      estimated_total: total,
      status: 'new',
    })

    if (dbError) {
      console.error('[quote] Database error:', JSON.stringify(dbError, null, 2))
      return NextResponse.json({ error: 'Failed to save', details: String(dbError) }, { status: 500 })
    }

    const apiKey = process.env.RESEND_API_KEY
    const priceBlock = total !== null
      ? `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%;margin-top:12px">
<tr><td style="padding:6px 16px 6px 0;color:#666">Estimated Subtotal</td><td style="padding:6px 0;font-weight:600">$${subtotal?.toFixed(2)}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Tax (6%)</td><td style="padding:6px 0">$${tax?.toFixed(2)}</td></tr>
<tr><td style="padding:8px 16px 8px 0;color:#000;font-weight:700;border-top:2px solid #eee">Estimated Total</td><td style="padding:8px 0;font-weight:700;border-top:2px solid #eee;color:#E8192C">$${total?.toFixed(2)}</td></tr>
</table>
<p style="font-size:12px;color:#999;margin-top:10px">This is an estimate. Final pricing confirmed after a brief assessment.</p>`
      : `<p style="font-size:14px;color:#333">Thanks for your interest! Since this service is customized, our team will review your details and follow up with a personalized quote shortly.</p>`

    const bookNowBlock = total !== null
  ? `<div style="background:#f8f6f2;padding:20px;text-align:center;margin-top:20px">
<a href="https://conveniencehubofmaryland.com/book" style="display:inline-block;background:#E8192C;color:#fff;padding:12px 28px;text-decoration:none;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px">View Your Quote →</a>
<p style="font-size:12px;color:#999;margin-top:10px">Click <strong>"Book Now with This Quote"</strong> to proceed with booking details.</p>
</div>`
  : `<div style="background:#f8f6f2;padding:20px;text-align:center;margin-top:20px">
<a href="https://conveniencehubofmaryland.com/book" style="display:inline-block;background:#E8192C;color:#fff;padding:12px 28px;text-decoration:none;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px">View Quote Request →</a>
<p style="font-size:12px;color:#999;margin-top:10px">Our team will send you a personalized quote shortly.</p>
</div>`

    if (apiKey) {
      try {
        // Notify admin
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'CHM Quotes <support@conveniencehubofmaryland.com>',
            to: ['conveniencehubofmaryland@gmail.com'],
            subject: `New Quote Request — ${name.trim()} (${category})`,
            html: `<h2 style="color:#E8192C">New Quote Request</h2>
<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%">
<tr><td style="padding:6px 16px 6px 0;color:#666">Name</td><td style="padding:6px 0;font-weight:600">${name.trim()}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Phone</td><td style="padding:6px 0"><a href="tel:${phone.trim()}">${phone.trim()}</a></td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Email</td><td style="padding:6px 0"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Category</td><td style="padding:6px 0">${category}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">Selections</td><td style="padding:6px 0"><pre style="white-space:pre-wrap;font-size:12px">${JSON.stringify(selections, null, 2)}</pre></td></tr>
</table>
${priceBlock}`,
          }),
        })

        // Confirmation to customer
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
            to: [email.trim()],
            subject: `Your Quote from Convenience Hub of Maryland`,
            html: `<h2 style="color:#E8192C">Thanks, ${name.trim()}!</h2>
<p style="font-size:14px;color:#333">Here's a summary of your request:</p>
${priceBlock}
${bookNowBlock}
<p style="font-size:13px;color:#666;margin-top:16px">Questions? Call or text us at 202-579-2944.</p>`,
          }),
        })
      } catch (err) {
        console.error('[quote] email error:', err)
      }
    }

    return NextResponse.json({ success: true, subtotal, tax, total, deposit, breakdown, bookLink })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[quote] error:', msg)
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 })
  }
}
