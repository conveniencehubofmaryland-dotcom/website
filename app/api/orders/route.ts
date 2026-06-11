export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Config error' }, { status: 500 })
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        customer_name: body.customer_name || '',
        customer_email: body.customer_email || '',
        customer_phone: body.customer_phone || '',
        customer_address: body.customer_address || '',
        order_items: body.order_items || [],
        subtotal: body.subtotal || 0,
        tax_amount: body.tax_amount || 0,
        total_amount: body.total_amount || 0,
        status: 'Pending Payment',
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      return Response.json({ error: 'Save failed' }, { status: 400 })
    }

    return Response.json({ success: true, orderId: data[0]?.id || 'unknown' })

  } catch (error) {
    return Response.json({ error: 'Error' }, { status: 500 })
  }
}
