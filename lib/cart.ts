// Shopping cart kept in this browser only. Prices are never stored here; the server reads them at payment time.
export type CartLine = { id: string; qty: number }

const KEY = 'chm_cart'
export const CART_EVENT = 'chm-cart-change'

export function readCart(): CartLine[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(value)) return []
    return value
      .filter((l): l is CartLine => typeof l?.id === 'string' && Number.isInteger(l?.qty) && l.qty > 0)
      .map(l => ({ id: l.id, qty: Math.min(20, l.qty) }))
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

export function addToCart(id: string) {
  const lines = readCart()
  const found = lines.find(l => l.id === id)
  if (found) found.qty = Math.min(20, found.qty + 1)
  else lines.push({ id, qty: 1 })
  writeCart(lines)
}

export function setQty(id: string, qty: number) {
  const next = readCart()
    .map(l => (l.id === id ? { ...l, qty: Math.max(0, Math.min(20, qty)) } : l))
    .filter(l => l.qty > 0)
  writeCart(next)
}

export function removeFromCart(id: string) {
  writeCart(readCart().filter(l => l.id !== id))
}

export function clearCart() {
  writeCart([])
}
