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
    await fetch(`${supabaseUrl}/rest/v1/orders`, {
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

    // Send customer email
    resend.emails.send({
      from: 'noreply@conveniencehubofmaryland.com',
      to: email,
      subject: `Order Confirmation: ${orderId}`,
      html: `<h2>Thank You!</h2><p>Order ID: ${orderId}</p><p>Total: $${total}</p><p>Send payment via Zelle to: conveniencehubofmaryland@gmail.com</p>`,
    }).catch(e => console.error('Email error:', e))

    // Send admin email
    resend.emails.send({
      from: 'noreply@conveniencehubofmaryland.com',
      to: 'conveniencehubofmaryland@gmail.com',
      subject: `New Order: ${orderId}`,
      html: `<h2>New Order</h2><p>Customer: ${name}</p><p>Email: ${email}</p><p>Total: $${total}</p>`,
    }).catch(e => console.error('Email error:', e))

    return Response.json({ success: true, orderId: orderId })
  } catch (error) {
    console.error('Order error:', error)
    return Response.json({ error: 'Failed to process order' }, { status: 500 })
  }
}
