// Shared product pricing and shipping rules. Used by the admin form, the cart, checkout and the payment route,
// so every screen and every charge uses the same numbers.

// Final sale price = cost + markup percentage of the cost. Example: cost $10, markup 50% → $15.00.
export function salePrice(cost: number, markupPercent: number): number {
  return Math.round(cost * (1 + markupPercent / 100) * 100) / 100
}

// Flat shipping by total package weight (USPS Ground Advantage, estimate: confirm against your real label prices).
// Anything heavier than the last tier is not shipped online; the customer arranges it by phone.
export const SHIPPING_TIERS: { maxLb: number; fee: number }[] = [
  { maxLb: 1, fee: 8 },
  { maxLb: 2, fee: 9 },
  { maxLb: 3, fee: 10 },
  { maxLb: 5, fee: 12 },
  { maxLb: 10, fee: 16 },
]

export type Fulfillment = 'pickup' | 'ship'

export function shippingFeeFor(totalLb: number): number | null {
  const tier = SHIPPING_TIERS.find(t => totalLb <= t.maxLb)
  return tier ? tier.fee : null
}

export type PricedLine = { price: number; qty: number; weight_lb: number | null }

export type OrderQuote = {
  subtotal: number
  shipping: number
  total: number
  // false when shipping is chosen but the order cannot ship online (missing weight, or too heavy)
  canShip: boolean
  totalLb: number | null
}

export function quoteOrder(lines: PricedLine[], fulfillment: Fulfillment): OrderQuote {
  const subtotal = Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100
  const totalLb = lines.every(l => l.weight_lb != null)
    ? Math.round(lines.reduce((s, l) => s + Number(l.weight_lb) * l.qty, 0) * 100) / 100
    : null
  if (fulfillment === 'pickup') {
    return { subtotal, shipping: 0, total: subtotal, canShip: true, totalLb }
  }
  const fee = totalLb == null ? null : shippingFeeFor(totalLb)
  if (fee == null) {
    return { subtotal, shipping: 0, total: subtotal, canShip: false, totalLb }
  }
  return { subtotal, shipping: fee, total: Math.round((subtotal + fee) * 100) / 100, canShip: true, totalLb }
}
