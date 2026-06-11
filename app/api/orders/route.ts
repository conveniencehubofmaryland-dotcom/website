import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Save to Supabase
    const { data, error: dbError } = await supabase
      .from('orders')
      .insert([
        {
          order_id: orderId,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          customer_address: address,
          items: items,
          total_amount: total,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (dbError) {
      console.error('Database error:', dbError)
      return Response.json(
        { error: 'Failed to save order to database' },
        { status: 500 }
      )
    }

    // Send admin email via Resend
    try {
      await resend.emails.send({
        from: 'noreply@conveniencehubofmaryland.com',
        to: 'conveniencehubofmaryland@gmail.com',
        subject: `New Order: ${orderId}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Customer:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          <h3>Items:</h3>
          <ul>
            ${items.map((item: any) => `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
          </ul>
        `,
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
      // Don't fail the order if email fails - log it but return success
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
