import { BUNDLES } from '@/lib/bundles'

// CLEANING: +20%
const STANDARD_CLEANING: Record<string, number> = {
  studio: 120, '1br': 180, '2br': 300, '3br': 420, '4br': 540, '5br+': 600,
}
const DEEP_CLEANING: Record<string, number> = {
  studio: 300, '1br': 360, '2br': 420, '3br': 540, '4br': 720, '5br+': 900,
}
const MOVEINOUT: Record<string, { good: number; poor: number }> = {
  '1br': { good: 540, poor: 720 },
  '3br': { good: 720, poor: 1080 },
  '4br': { good: 960, poor: 1440 },
  '5br': { good: 1140, poor: 1620 },
}
const FREQUENCY_DISCOUNT: Record<string, number> = {
  onetime: 0, monthly: 0.03, biweekly: 0.03, weekly: 0.05, twiceweekly: 0.05,
}
const PET_FEE: Record<string, number> = { '0': 0, '1': 33, '2': 60, '3+': 96 }
const ADDON_PRICES: Record<string, number> = {
  carpet: 210, windowInt: 117, windowExt: 210, appliance: 135,
  grout: 255, petOdor: 165, disinfect: 90,
}
const FIRST_TIME_DISCOUNT = 0.03

// LAUNDRY: +15%
const LAUNDRY_PER_LB: Record<string, number> = {
  colors: 4.59, mixed: 5.74, bedding: 5.74, whites: 8.04, wool: 9.19, delicates: 10.34,
}
const LAUNDRY_PREMIUM_PER_LB: Record<string, number> = {
  none: 0, ironhang: 2.30, expressiron: 4.60, samedayexpress: 2.01,
}
const LAUNDRY_FOLDING_RATE = 1.73
const LAUNDRY_RECURRING: Record<string, number> = {
  light: 160, standard: 290, premium: 405, unlimited: 575,
}
const LAUNDRY_ADDON_PRICES: Record<string, number> = {
  stainRemoval: 17.25, allergenFree: 17.25, hypoallergenic: 11.5,
  comforter: 46, beddingSet: 57.5, curtainPanels: 4.03, tablecloths: 23,
}

// MEAL PREP: +15%
const MEALPREP_PLANS: Record<string, number> = {
  starter: 405, standard: 775, premium: 1120, luxury: 1550,
}
const CULINARY_HOURLY: Record<string, { rate: number; minHrs: number }> = {
  personalchef: { rate: 103.5, minHrs: 3 },
  eventcatering: { rate: 100.63, minHrs: 4 },
  kitchencoaching: { rate: 120.75, minHrs: 2 },
}
const CULINARY_SPECIALTY_PER_SERVING: Record<string, number> = {
  breakfast: 11.5, lunch: 14.38, dinner: 18.4, dessert: 10.35,
}
const CULINARY_GROCERY: Record<string, number> = {
  basic: 46, premium: 71.88,
}
const CULINARY_DIETARY_PCT: Record<string, number> = {
  glutenfree: 0.175, vegan: 0.10, keto: 0.175,
}

// NANNY / CHILDCARE: +15%
const NANNY_MONTHLY: Record<string, { cost: number; avgWeeklyHrs: number }> = {
  parttime: { cost: 3220, avgWeeklyHrs: 17.5 },
  standard: { cost: 6382.5, avgWeeklyHrs: 32.5 },
  premium:  { cost: 9890, avgWeeklyHrs: 40 },
}
const NANNY_HOURLY: Record<string, { rate: number; minHrs: number }> = {
  babysitting: { rate: 46, minHrs: 2 },
  overnight: { rate: 40.5, minHrs: 8 },
  nannyhousekeeping: { rate: 46, minHrs: 3 },
  event: { rate: 40.5, minHrs: 2 },
}
const NANNY_SPECIALIZED_PER_HR: Record<string, number> = {
  infant: 4.6, specialneeds: 7.48, bilingual: 5.75,
}
const NANNY_EXTRA_CHILD_PER_HR = 4.03
const NANNY_WEEKEND_PER_HR = 4.6
const NANNY_HOLIDAY_MULTIPLIER = 0.375

// ELDER / COMPANION CARE: +15%
const CARE_MONTHLY: Record<string, { cost: number; avgWeeklyHrs: number }> = {
  light: { cost: 1035, avgWeeklyHrs: 9 },
  standard: { cost: 2732.5, avgWeeklyHrs: 22.5 },
  fulltime: { cost: 5750, avgWeeklyHrs: 40 },
  '24hour': { cost: 11500, avgWeeklyHrs: 168 },
}
const CARE_HOURLY: Record<string, { rate: number; minHrs: number }> = {
  companion: { rate: 40.5, minHrs: 2 },
  personalcare: { rate: 40.5, minHrs: 3 },
  postrecovery: { rate: 40.5, minHrs: 4 },
  respite: { rate: 40.5, minHrs: 4 },
  overnight: { rate: 40.5, minHrs: 8 },
}
const CARE_SPECIALIZED_PER_HR: Record<string, number> = {
  dementia: 6.9, postsurgical: 8.63, mobility: 5.18, medication: 3.45,
}
const CARE_DAY_PROGRAM: Record<string, number> = {
  social: 402.5, wellness: 575, fullservice: 777.5,
}

export type Selections = Record<string, unknown>
export type LineItem = { label: string; amount: number }

export function calcCleaning(sel: Selections): { total: number; breakdown: LineItem[] } {
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
      breakdown.push({ label: 'First-Time Customer Discount (3%)', amount: -discountAmt })
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

export function calcLaundry(sel: Selections): { total: number; breakdown: LineItem[] } {
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
    breakdown.push({ label: `Folding Only — ${weight} lbs @ $${LAUNDRY_FOLDING_RATE.toFixed(2)}/lb`, amount: cost })
    total = cost
  } else {
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

  const addOnQty = (sel.addOnQty || {}) as Record<string, number>
  const addonLabels: Record<string, string> = {
    stainRemoval: 'Stain Removal Treatment', allergenFree: 'Allergen-Free Wash Cycle',
    hypoallergenic: 'Hypoallergenic Detergent', comforter: 'Comforter/Duvet Cleaning',
    beddingSet: 'Bedding Set', curtainPanels: 'Curtain Panels', tablecloths: 'Tablecloths',
  }
  for (const [key, price] of Object.entries(LAUNDRY_ADDON_PRICES)) {
    const qty = Number(addOnQty[key]) || 0
    if (qty > 0) {
      const cost = price * qty
      breakdown.push({ label: `${addonLabels[key]} × ${qty}`, amount: cost })
      total += cost
    }
  }

  return { total, breakdown }
}

export function calcMealPrep(sel: Selections): { total: number; breakdown: LineItem[] } {
  const breakdown: LineItem[] = []
  const mode = (sel.mode as string) || 'monthly'
  let total = 0

  if (mode === 'hourly') {
    const opt = CULINARY_HOURLY[sel.subtype as string]
    if (opt) {
      const hrs = Math.max(opt.minHrs, Number(sel.hours) || opt.minHrs)
      const labels: Record<string, string> = {
        personalchef: 'Personal Chef / Meal Prep',
        eventcatering: 'Special Event Catering Prep',
        kitchencoaching: 'Kitchen Coaching & Training',
      }
      const cost = opt.rate * hrs
      breakdown.push({ label: `${labels[sel.subtype as string]} — ${hrs} hrs @ $${opt.rate}/hr`, amount: cost })
      total = cost
    }
  } else if (mode === 'specialty') {
    const qty = (sel.specialtyQty || {}) as Record<string, number>
    const labels: Record<string, string> = {
      breakfast: 'Breakfast Prep', lunch: 'Lunch Pack', dinner: 'Dinner Entrée', dessert: 'Dessert/Baked Goods',
    }
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
    const labels: Record<string, string> = {
      basic: 'Basic Grocery Shopping', premium: 'Premium Sourcing (Specialty/Organic)',
    }
    breakdown.push({ label: `${labels[service]} × ${visits} visit(s)`, amount: cost })
    total = cost
  } else {
    const cost = MEALPREP_PLANS[sel.planTier as string] || 0
    breakdown.push({ label: `Meal Prep Plan (${sel.planTier})`, amount: cost })
    total = cost
  }

  if ((mode === 'monthly' || mode === 'specialty') && Array.isArray(sel.dietary)) {
    const dietaryLabels: Record<string, string> = {
      glutenfree: 'Gluten-Free (+17.5%)', vegan: 'Vegan/Vegetarian (+10%)', keto: 'Keto/Low-Carb (+17.5%)',
    }
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

export function calcNanny(sel: Selections): { total: number; breakdown: LineItem[] } {
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
    const labels: Record<string, string> = {
      infant: 'Infant Care Specialist', specialneeds: 'Special Needs Care', bilingual: 'Bilingual Nanny',
    }
    for (const s of sel.specialized as string[]) {
      const perHr = NANNY_SPECIALIZED_PER_HR[s]
      if (perHr && effectiveHrs > 0) {
        const cost = perHr * effectiveHrs
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

export function calcElderCare(sel: Selections): { total: number; breakdown: LineItem[] } {
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
    const labels: Record<string, string> = {
      dementia: "Dementia/Alzheimer's Care",
      postsurgical: 'Post-Surgical Recovery Support',
      mobility: 'Mobility & Physical Assistance',
      medication: 'Medication Management',
    }
    for (const s of sel.specialized as string[]) {
      const perHr = CARE_SPECIALIZED_PER_HR[s]
      if (perHr && effectiveHrs > 0) {
        const cost = perHr * effectiveHrs
        breakdown.push({ label: labels[s], amount: cost })
        total += cost
      }
    }
  }

  return { total, breakdown }
}

// Single source of truth for quote totals. Returns null total for unknown categories.
function computeBaseQuote(category: string, selections: Selections): { total: number | null; breakdown: LineItem[] } {
  if (category.startsWith('bundle-')) {
    const bundle = BUNDLES.find(b => b.id === category.slice('bundle-'.length))
    if (!bundle || !bundle.price) return { total: null, breakdown: [] }
    return { total: bundle.price, breakdown: [{ label: `${bundle.name} bundle (first month)`, amount: bundle.price }] }
  }
  if (category === 'cleaning') return calcCleaning(selections)
  if (category === 'laundry') return calcLaundry(selections)
  if (category === 'mealprep') return calcMealPrep(selections)
  if (category === 'nanny') return calcNanny(selections)
  if (category === 'eldercare') return calcElderCare(selections)
  return { total: null, breakdown: [] }
}

// Members get an extra 2% off recurring plans (added on top of the frequency discount).
const MEMBER_RECURRING_DISCOUNT = 0.02
const RECURRING_FREQUENCIES = ['weekly', 'twiceweekly', 'biweekly', 'monthly']

export function computeQuote(
  category: string,
  selections: Selections,
  opts?: { member?: boolean; realtor?: boolean }
): { total: number | null; breakdown: LineItem[] } {
  // Realtor referral code: 15% off all services. It replaces the first-time and member discounts (best one only).
  if (opts?.realtor) {
    const base = computeBaseQuote(category, { ...selections, firstTime: false })
    if (base.total === null) return base
    const off = Math.round(base.total * 0.15 * 100) / 100
    return {
      total: Math.round((base.total - off) * 100) / 100,
      breakdown: [...base.breakdown, { label: 'Realtor Referral Discount (15%)', amount: -off }],
    }
  }
  const result = computeBaseQuote(category, selections)
  const freq = (selections as Record<string, unknown>).frequency as string | undefined
  if (!opts?.member || result.total === null || !freq || !RECURRING_FREQUENCIES.includes(freq)) {
    return result
  }
  const memberAmt = Math.round(result.total * MEMBER_RECURRING_DISCOUNT * 100) / 100
  return {
    total: Math.round((result.total - memberAmt) * 100) / 100,
    breakdown: [...result.breakdown, { label: 'Member Discount (2% recurring)', amount: -memberAmt }],
  }
}
