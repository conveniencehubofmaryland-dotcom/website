// Shop settings used on the website, in checkout and in emails.

// Your pickup location. Leave empty until you give the address; the wording then asks the customer to call first.
export const PICKUP_LOCATION: string = ''

export const SHOP_PHONE = '202-579-2944'

export function pickupInstructions(): string {
  const where = PICKUP_LOCATION.trim() ? ` Pickup location: ${PICKUP_LOCATION.trim()}.` : ''
  return `Pickup is arranged by phone. Call or text ${SHOP_PHONE} to arrange the pickup location, date and time.${where}`
}
