export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Order body:', body)

    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      customer_address, 
      order_items, 
      subtotal, 
      tax_amount, 
      total_amount 
    } = body

    // Validate required fields
    if (!customer_name || !customer_email || !customer_phone || !customer_address) {
      return Response.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars')
      return Response.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          order_items: order_items || [],
          subtotal: subtotal || 0,
          tax_amount: tax_amount || 0,
          total_amount: total_amount || 0,
          status: 'Pending Payment',
        }),
      }
    )

    const insertData = await insertResponse.json()
    console.log('Insert response:', insertData)

    if (!insertResponse.ok) {
      console.error('Supabase insert error:', insertData)
      return Response.json(
        { error: insertData.message || 'Failed to create order' },
        { status: insertResponse.status }
      )
    }

    const orderId = insertData[0]?.id || 'unknown'

    // Send email
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          to: 'conveniencehubofmaryland@gmail.com',
          subject: `New Order: ${customer_name}`,
          html: `
            <h2>New Order Received</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${customer_name}</p>
            <p><strong>Email:</strong> ${customer_email}</p>
            <p><strong>Phone:</strong> ${customer_phone}</p>
            <p><strong>Address:</strong> ${customer_address}</p>
            <p><strong>Total:</strong> $${total_amount?.toFixed(2)}</p>
            <p>Please send payment link via Zelle or CashApp.</p>
          `,
        }),
      })
    } catch (emailError) {
      console.error('Email sending failed (non-blocking):', emailError)
    }

    return Response.json(
      { success: true, orderId },
      { status: 200 }
    )
  } catch (error) {
    console.error('Order API error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
