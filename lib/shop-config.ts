// Shop settings used on the website, in checkout and in emails.

// Your pickup location. Leave empty until you give the address; the wording then asks the customer to call first.
export const PICKUP_LOCATION: string = ''

export const SHOP_PHONE = '202-579-2944'

export function pickupInstructions(): string {
  const where = PICKUP_LOCATION.trim()
    ? `Pickup location: ${PICKUP_LOCATION.trim()}.`
    : 'We will confirm the pickup location with you.'
  return `Pickup is arranged with the store. Call or text ${SHOP_PHONE} to set a pickup time. ${where}`
}
