// Clover settings used by the website's card form (public values only; the private key stays on the server).
export const CLOVER_MERCHANT_ID = '958280968883'
export const CLOVER_PUBLIC_TOKEN = '274936ac4ed1a9fa6658979fcd965b99'
// Live card-entry script. Use https://checkout.sandbox.dev.clover.com/sdk.js only with sandbox keys.
export const CLOVER_SDK_URL = 'https://checkout.clover.com/sdk.js'

// Your existing Clover payment page, shown as a small backup link.
export const CLOVER_FALLBACK_LINK = 'https://link.clover.com/urlshortener/m92Kg8'

// Remembers the latest card payment in this browser tab so the booking form can send it with the booking.
const PAYMENT_KEY = 'chm_last_payment'

export function saveCloverCharge(chargeId: string, amount: number) {
  try {
    sessionStorage.setItem(PAYMENT_KEY, JSON.stringify({ chargeId, amount, at: Date.now() }))
  } catch {
    // Storage can be blocked; the booking then simply has no payment attached.
  }
}

export function getSavedCloverCharge(): string | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(PAYMENT_KEY) || 'null')
    if (!saved?.chargeId || Date.now() - saved.at > 24 * 60 * 60 * 1000) return null
    return String(saved.chargeId)
  } catch {
    return null
  }
}
