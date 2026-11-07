// Your existing Clover payment page, used as a backup if automatic checkout fails.
export const CLOVER_FALLBACK_LINK = 'https://link.clover.com/urlshortener/m92Kg8'

// Starts a Clover hosted checkout. The server works out the exact amount from the quote details.
export async function startCloverCheckout(
  kind: 'deposit' | 'full',
  category: string,
  selections: Record<string, unknown>,
  contact: { name?: string; email?: string }
): Promise<string> {
  const res = await fetch('/api/payments/clover-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, category, selections, name: contact.name, email: contact.email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Could not start payment. Please call 202-579-2944.')
  }
  return data.url as string
}
