export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, phone, address, items, total } = body

  if (!name || !email || !phone || !address || !items?.length || !total) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const orderId = `ORD-${Date.now()}`
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.06
  const totalAmount = subtotal + tax

  const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    body: JSON.stringify({ order_id: orderId, customer_name: name, customer_email: email, customer_phone: phone, customer_address: address, subtotal, tax_amount: tax, total_amount: totalAmount, status: 'pending', created_at: new Date().toISOString() }),
  })

  if (!res.ok) return Response.json({ error: 'Failed to save order' }, { status: 500 })
  return Response.json({ success: true, orderId })
}
