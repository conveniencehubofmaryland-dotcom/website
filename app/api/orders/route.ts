import { NextResponse } from 'next/server'
import { sendAdminEmail } from '@/lib/email'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

interface OrderItem {
  id: string
  sku: string
  title: string
  price: number
  qty: number
}

interface OrderData {
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  order_items: OrderItem[]
  subtotal: number
  tax_amount: number
  total_amount: number
  status: string
}

export async function POST(req: Request) {
  try {
    const orderData: OrderData = await req.json()

    // Validate required fields
    if (!orderData.customer_name || !orderData.customer_email || !orderData.customer_phone || !orderData.customer_address || !orderData.order_items) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create order in Supabase
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY || '',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      } as HeadersInit,
      body: JSON.stringify(orderData),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const [createdOrder] = await res.json()

    // Send email to admin with order details
    const itemsText = orderData.order_items
      .map((item: OrderItem) => `- ${item.title} (SKU: ${item.sku}) x${item.qty} @ $${item.price}/ea = $${(item.price * item.qty).toFixed(2)}`)
      .join('\n')

    const emailContent = `
New Order Received!

Order ID: ${createdOrder.id}
Order Date: ${new Date(createdOrder.created_at).toLocaleString()}
Status: Pending Payment

CUSTOMER INFORMATION:
Name: ${orderData.customer_name}
Email: ${orderData.customer_email}
Phone: ${orderData.customer_phone}
Address: ${orderData.customer_address}

ORDER ITEMS:
${itemsText}

TOTALS:
Subtotal: $${orderData.subtotal.toFixed(2)}
Tax (6%): $${orderData.tax_amount.toFixed(2)}
Grand Total: $${orderData.total_amount.toFixed(2)}

Next Steps:
1. Review the order details above
2. Send a payment request via Zelle or CashApp to the customer
3. Mark order as paid once payment is received
4. Create a shift in the admin dashboard for staff to claim

---
Convenience Hub of Maryland
`

    try {
      await sendAdminEmail({
        subject: `New Order #${createdOrder.id.slice(0, 8).toUpperCase()} - ${orderData.customer_name}`,
        body: emailContent,
      })
    } catch (emailErr) {
      console.error('Failed to send email:', emailErr)
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      id: createdOrder.id,
      message: 'Order created successfully',
    })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
  }
}
