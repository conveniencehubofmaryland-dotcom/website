// Shopping cart kept in this browser only. Prices are never stored here; the server reads them at payment time.
// A line is one product in one colour and size (colour and size are empty when the product has no choices).
export type CartLine = { id: string; qty: number; colour?: string | null; size?: string | null }

const KEY = 'chm_cart'
export const CART_EVENT = 'chm-cart-change'

// Unique key for a cart line: product + colour + size.
export function lineKey(l: { id: string; colour?: string | null; size?: string | null }): string {
  return `${l.id}|${l.colour ?? ''}|${l.size ?? ''}`
}

export function readCart(): CartLine[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(value)) return []
    return value
      .filter((l): l is CartLine => typeof l?.id === 'string' && Number.isInteger(l?.qty) && l.qty > 0)
      .map(l => ({
        id: l.id,
        qty: Math.min(20, l.qty),
        colour: typeof l.colour === 'string' && l.colour ? l.colour : null,
        size: typeof l.size === 'string' && l.size ? l.size : null,
      }))
  } catch {
    return []
  }
}

export function writeCart(lines: CartLine[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines))
  } catch {
    // Private browsing can block storage. The cart then simply does not persist.
  }
  window.dispatchEvent(new Event(CART_EVENT))
}

export function addToCart(id: string, colour: string | null = null, size: string | null = null) {
  const lines = readCart()
  const want = { id, colour, size }
  const found = lines.find(l => lineKey(l) === lineKey(want))
  if (found) found.qty = Math.min(20, found.qty + 1)
  else lines.push({ ...want, qty: 1 })
  writeCart(lines)
}

export function setQty(key: string, qty: number) {
  const next = readCart()
    .map(l => (lineKey(l) === key ? { ...l, qty: Math.max(0, Math.min(20, qty)) } : l))
    .filter(l => l.qty > 0)
  writeCart(next)
}

export function removeFromCart(key: string) {
  writeCart(readCart().filter(l => lineKey(l) !== key))
}

export function clearCart() {
  writeCart([])
}
