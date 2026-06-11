import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, items, total } = body

    // Validate required fields
    if (!name || !email || !phone || !address || !items || !total) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}`

    // Save to Supabase using REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return Response.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    const dbResponse = await fetch(
      `${supabaseUrl}/rest/v1/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          customer_address: address,
          items: items,
          total_amount: total,
          status: 'pending',
          created_at: new Date().toISOString(),
        }),
      }
    )

    if (!dbResponse.ok) {
      const dbError = await dbResponse.text()
      console.error('Database error:', dbError)
      return Response.json(
        { error: 'Failed to save order to database' },
        { status: 500 }
      )
    }

    // Send customer confirmation email
    try {
      await resend.emails.send({
        from: 'noreply@conveniencehubofmaryland.com',
        to: email,
        subject: `Order Confirmation: ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Thank You for Your Order!</h2>
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your order has been received. Here are your details:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Total Amount:</strong> $${total.toFixed(2)}</p>
              <p><strong>Delivery Address:</strong> ${address}</p>
            </div>

            <h3>Order Items:</h3>
            <ul>
              ${items.map((item: any) => `
                <li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
              `).join('')}
            </ul>

            <h3 style="color: #c41e3a;">Payment Instructions:</h3>
            <p>Please send payment via <strong>Zelle</strong> to:</p>
            <p style="font-size: 16px; font-weight: bold; color: #c41e3a;">
              conveniencehubofmaryland@gmail.com
            </p>
            
            <p style="margin-top: 20px; color: #666;">
              Once payment is received, we'll process and ship your order within 1 business day.
            </p>

            <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #999;">
              Questions? Contact us at conveniencehubofmaryland@gmail.com
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Customer email send error:', emailError)
      // Don't fail the order if customer email fails
    }

    // Send admin notification email
    try {
      await resend.emails.send({
        from: 'noreply@conveniencehubofmaryland.com',
        to: 'conveniencehubofmaryland@gmail.com',
        subject: `New Order: ${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>New Order Received</h2>
            <p><strong>Order ID:</strong> ${orderId}</p>
            
            <h3>Customer Details:</h3>
            <p>
              <strong>Name:</strong> ${name}<br>
              <strong>Email:</strong> ${email}<br>
              <strong>Phone:</strong> ${phone}<br>
              <strong>Address:</strong> ${address}
            </p>

            <h3>Order Items:</h3>
            <ul>
              ${items.map((item: any) => `
                <li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
              `).join('')}
            </ul>

            <p><strong>Total Amount:</strong> $${total.toFixed(2)}</p>
            <p style="color: #666;">Status: Pending payment via Zelle</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Admin email send error:', emailError)
      // Don't fail the order if admin email fails
    }

    return Response.json({
      success: true,
      orderId: orderId,
    })
  } catch (error) {
    console.error('Order API error:', error)
    return Response.json(
      { error: 'Failed to process order' },
      { status: 500 }
    )
  }
}
