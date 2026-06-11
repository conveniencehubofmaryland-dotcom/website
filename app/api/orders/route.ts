export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('✅ Body received:', body)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log('📍 Supabase URL exists:', !!supabaseUrl)
    console.log('📍 Supabase Key exists:', !!supabaseKey)

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing env vars')
      return Response.json(
        { error: 'Configuration error' }, 
        { status: 500 }
      )
    }

    console.log('🔗 Connecting to:', supabaseUrl)

    const response = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        customer_address: body.customer_address,
        order_items: body.order_items,
        subtotal: body.subtotal,
        tax_amount: body.tax_amount,
        total_amount: body.total_amount,
        status: 'Pending Payment',
      }),
    })

    console.log('📊 Response status:', response.status)

    const data = await response.json()
    console.log('📦 Response data:', data)

    if (!response.ok) {
      console.error('❌ Insert failed:', data)
      return Response.json(
        { error: data.message || 'Failed to save order' }, 
        { status: 400 }
      )
    }

    const orderId = data[0]?.id || 'unknown'
    console.log('✅ Order created:', orderId)

    return Response.json({ 
      success: true, 
      orderId: orderId 
    })

  } catch (error) {
    console.error('💥 Error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
