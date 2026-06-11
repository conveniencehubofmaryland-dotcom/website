import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, items, total } = body

    if (!name || !email || !phone || !address || !items || !total) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const orderId = `ORD-${Date.now()}`
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: 'Database error' }, { status: 500 })
    }

    // Save order to Supabase
    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
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
    })

    if (!dbResponse.ok) {
      return Response.json({ error: 'Failed to save order' }, { status: 500 })
    }

    const itemsList = items.map((item: { name: string; quantity: number; price: number }) => 
      `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`
    ).join('')

    // Send customer email
    try {
      const customerEmailResponse = await resend.emails.send({
        from: 'orders@conveniencehubofmaryland.com',
        to: email,
        subject: `Order Confirmation: ${orderId}`,
        html: `<h2>Thank You for Your Order!</h2><p>Order ID: <strong>${orderId}</strong></p><p>Total: <strong>$${total.toFixed(2)}</strong></p><h3>Items:</h3><ul>${itemsList}</ul><p><strong>Payment Instructions:</strong></p><p>Send payment via Zelle to: <strong>conveniencehubofmaryland@gmail.com</strong></p>`,
      })
      console.log('Customer email sent:', customerEmailResponse)
    } catch (emailError) {
      console.error('Customer email error:', emailError)
    }

    // Send admin email
    try {
      const adminEmailResponse = await resend.emails.send({
        from: 'orders@conveniencehubofmaryland.com',
        to: 'conveniencehubofmaryland@gmail.com',
        subject: `New Order: ${orderId}`,
        html: `<h2>New Order Received</h2><p><strong>Customer:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Address:</strong> ${address}</p><h3>Items:</h3><ul>${itemsList}</ul><p><strong>Total:</strong> $${total.toFixed(2)}</p>`,
      })
      console.log('Admin email sent:', adminEmailResponse)
    } catch (emailError) {
      console.error('Admin email error:', emailError)
    }

    return Response.json({ success: true, orderId: orderId })
  } catch (error) {
    console.error('Order error:', error)
    return Response.json({ error: 'Failed to process order' }, { status: 500 })
  }
}
