import { NextRequest, NextResponse } from 'next/server'
import { dbInsertService } from '@/lib/db'

const TAX_RATE = 0.06

const STANDARD_CLEANING: Record<string, number> = {
  studio: 150, '1br': 200, '2br': 250, '3br': 300, '4br': 350, '5br+': 450,
}
const DEEP_CLEANING: Record<string, number> = {
  studio: 250, '1br': 300, '2br': 350, '3br': 450, '4br': 600, '5br+': 750,
}
const MOVEINOUT: Record<string, { good: number; poor: number }> = {
  '1br': { good: 380, poor: 520 },
  '3br': { good: 580, poor: 820 },
  '4br': { good: 760, poor: 1100 },
  '5br': { good: 950, poor: 1350 },
}
const FREQUENCY_DISCOUNT: Record<string, number> = {
  onetime: 0, monthly: 0.10, biweekly: 0.15, weekly: 0.20, twiceweekly: 0.25,
}
const PET_FEE: Record<string, number> = { '0': 0, '1': 27.5, '2': 50, '3+': 80 }
const ADDON_PRICES: Record<string, number> = {
  carpet: 175, windowInt: 97.5, windowExt: 175, appliance: 112.5,
  grout: 212.5, petOdor: 137.5, disinfect: 75,
}
const FIRST_TIME_SURCHARGE = 0.30

const LAUNDRY_DROPOFF: Record<string, number> = { wdf: 30, wih: 42.5, premium: 62.5 }
const LAUNDRY_PICKUP: Record<string, number> = { wdf: 45, wih: 55, premium: 75 }
const EXPRESS_SURCHARGE = 0.50
const LAUNDRY_RECURRING: Record<string, number> = {
  standard: 160, regular: 300, premium: 420, luxury: 560,
}

const MEALPREP_PLANS: Record<string, number> = {
  starter: 350, standard: 675, premium: 975, luxury: 1350,
}

type Selections = Record<string, unknown>

function calcCleaning(sel: Selections): number {
  let base = 0
  const serviceType = sel.serviceType as string

  if (serviceType === 'moveinout') {
    const moveSize = sel.moveSize as string
    const condition = sel.moveCondition as 'good' | 'poor'
    const sizeTable = MOVEINOUT[moveSize]
    base = sizeTable ? sizeTable[condition] || 0 : 0
  } else {
    const table = serviceType === 'deep' ? DEEP_CLEANING : STANDARD_CLEANING
    const homeSize = sel.homeSize as string
    base = table[homeSize] || 0
    if (serviceType === 'standard' && sel.firstTime) {
      base = base * (1 + FIRST_TIME_SURCHARGE)
    }
    const discount = FREQUENCY_DISCOUNT[sel.frequency as string] ?? 0
    base = base * (1 - discount)
  }

  let addOnsTotal = 0
  if (Array.isArray(sel.addOns)) {
    for (const a of sel.addOns as string[]) addOnsTotal += ADDON_PRICES[a] || 0
  }

  const petFee = PET_FEE[sel.pets as string] || 0

  return base + addOnsTotal + petFee
}

function calcLaundry(sel: Selections): number {
  const planType = sel.planType as string

  if (planType === 'recurring') {
    return LAUNDRY_RECURRING[sel.recurringPlan as string] || 0
  }

  const table = planType === 'pickupdelivery' ? LAUNDRY_PICKUP : LAUNDRY_DROPOFF
  const perLoad = table[sel.serviceType as string] || 0
  const loads = Math.max(1, Number(sel.loads) || 1)
  let subtotal = perLoad * loads

  if (sel.express) subtotal = subtotal * (1 + EXPRESS_SURCHARGE)

  return subtotal
}

function calcMealPrep(sel: Selections): number {
  return MEALPREP_PLANS[sel.planTier as string] || 0
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, category, selections } = body

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let subtotal: number | null = null
    let tax: number | null = null
    let total: number | null = null

    if (category === 'cleaning') {
      subtotal = calcCleaning(selections || {})
    } else if (category === 'laundry') {
      subtotal = calcLaundry(selections || {})
    } else if (category === 'mealprep') {
      subtotal = calcMealPrep(selections || {})
    }

    if (subtotal !== null) {
      subtotal = Math.round(subtotal * 100) / 100
      tax = Math.round(subtotal * TAX_RATE * 100) / 100
      total = Math.round((subtotal + tax) * 100) / 100
    }

    const { error: dbError } = await dbInsertService('quote_requests', {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      category,
      selections: selections || {},
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
<p style="font-size:13px;color:#666;margin-top:16px">Questions? Call or text us at 202-579-2944.</p>`,
          }),
        })
      } catch (err) {
        console.error('[quote] email error:', err)
      }
    }

    return NextResponse.json({ success: true, subtotal, tax, total })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[quote] error:', msg)
    return NextResponse.json({ error: 'Server error', details: msg }, { status: 500 })
  }
}
