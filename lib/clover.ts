// Starts a Clover hosted checkout for an exact amount and returns the payment page address.
export async function startCloverCheckout(amount: number, label: string): Promise<string> {
  const res = await fetch('/api/payments/clover-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, label }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Could not start payment. Please call 202-579-2944.')
  }
  return data.url as string
}
