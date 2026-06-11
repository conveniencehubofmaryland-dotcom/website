interface OrderData {
  customer_name: string
  customer_email: string
  items: Array<{ name: string; quantity: number; price: number }>
  total: number
  subtotal: number
  tax_amount: number
}

async function sendCustomerEmail(order: OrderData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  
  try {
    const itemsList = order.items
      .map(item => `<li style="padding:8px 0">${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</li>`)
      .join('')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${apiKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        from: 'Convenience Hub of Maryland <orders@conveniencehubofmaryland.com>',
        reply_to: ['conveniencehubofmaryland@gmail.com'],
        to: [order.customer_email],
        subject: 'Order Confirmation — Payment Instructions',
        html: `
          <div style="font-family:sans-serif;max-width:580px;margin:0 auto">
            <div style="background:#E8192C;padding:24px 32px">
              <h1 style="color:#fff;font-size:20px;margin:0">Order Received</h1>
            </div>
            <div style="padding:32px;background:#fff;border:1px solid #eee">
              <p style="font-size:15px;color:#333">Hi ${order.customer_name},</p>
              <p style="font-size:14px;color:#555">Thank you for your order! Please review the details below and follow the payment instructions.</p>
              
              <h3 style="font-size:14px;color:#222;margin-top:24px;margin-bottom:12px">Order Items</h3>
              <ul style="list-style:none;padding:0;margin:0;border-bottom:1px solid #f0f0f0;padding-bottom:16px">${itemsList}</ul>
              
              <table style="width:100%;font-size:14px;margin-top:16px">
                <tr style="border-bottom:1px solid #f0f0f0">
                  <td style="padding:8px 0;color:#666">Subtotal</td>
                  <td style="text-align:right;font-weight:600">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom:1px solid #f0f0f0">
                  <td style="padding:8px 0;color:#666">Tax (6% MD)</td>
                  <td style="text-align:right;font-weight:600">$${order.tax_amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;font-size:16px;color:#222;font-weight:700">Total</td>
                  <td style="text-align:right;font-size:16px;color:#E8192C;font-weight:700">$${order.total.toFixed(2)}</td>
                </tr>
              </table>

              <div style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;padding:16px;margin-top:24px">
                <p style="font-size:13px;color:#666;margin:0 0 12px 0;font-weight:600;text-transform:uppercase">Payment Instructions</p>
                <p style="font-size:14px;color:#222;margin:0 0 8px 0"><strong>Send payment via Zelle to:</strong></p>
                <p style="font-size:16px;color:#E8192C;margin:0;font-weight:700">conveniencehubofmaryland@gmail.com</p>
                <p style="font-size:12px;color:#999;margin:12px 0 0 0">Payment will be verified and your order will ship within 1 business day of receipt.</p>
              </div>

              <p style="font-size:14px;color:#555;margin-top:24px">Questions? Contact us at <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a> or reply to this email.</p>
              <p style="font-size:12px;color:#aaa;margin-top:32px">Convenience Hub of Maryland · Maryland · Virginia · Washington D.C.</p>
            </div>
          </div>
        `,
      }),
    })
    
    if (!res.ok) {
      console.error('[orders] sendCustomerEmail failed:', await res.text())
    }
  } catch (e) {
    console.error('[orders] sendCustomerEmail error:', e)
  }
}

async function sendAdminEmail(order: OrderData) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  
  try {
    const itemsList = order.items
      .map(item => `<li>${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</li>`)
      .join('')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${apiKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        from: 'CHM Orders <orders@conveniencehubofmaryland.com>',
        to: ['conveniencehubofmaryland@gmail.com'],
        subject: `New Product Order — $${order.total.toFixed(2)}`,
        html: `
          <h2 style="color:#E8192C">New Product Order</h2>
          <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;width:100%">
            <tr style="border-bottom:1px solid #f0f0f0">
              <td style="padding:8px 16px 8px 0;color:#666;width:120px">Customer</td>
              <td style="font-weight:600">${order.customer_name}</td>
            </tr>
          </table>

          <h3 style="margin-top:20px;color:#222;font-size:14px">Items</h3>
          <ul style="margin:8px 0;padding-left:20px">${itemsList}</ul>

          <table style="border-collapse:collapse;font-size:14px;margin-top:16px;width:100%">
            <tr><td style="padding:4px 0">Subtotal:</td><td style="text-align:right">$${order.subtotal.toFixed(2)}</td></tr>
            <tr><td style="padding:4px 0">Tax:</td><td style="text-align:right">$${order.tax_amount.toFixed(2)}</td></tr>
            <tr style="border-top:2px solid #f0f0f0"><td style="padding:8px 0;font-weight:700">Total:</td><td style="text-align:right;font-weight:700">$${order.total.toFixed(2)}</td></tr>
          </table>

          <p style="margin-top:16px;font-size:13px;color:#666"><strong>Status:</strong> Awaiting payment via Zelle</p>
        `,
      }),
    })
    
    if (!res.ok) {
      console.error('[orders] sendAdminEmail failed:', await res.text())
    }
  } catch (e) {
    console.error('[orders] sendAdminEmail error:', e)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, items, total } = body

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !address?.trim() || !items?.length || !total) {
      console.error('[orders] Missing fields:', { name, email, phone, address, items: items?.length, total })
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const orderId = `ORD-${Date.now()}`
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('[orders] Missing Supabase config')
      return Response.json({ error: 'Configuration error' }, { status: 500 })
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item) => sum + (item.price * item.quantity), 0)
    const taxAmount = subtotal * 0.06
    const totalAmount = subtotal + taxAmount

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
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
        order_items: items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        status: 'pending',
        created_at: new Date().toISOString(),
      }),
    })

    if (!dbResponse.ok) {
      const error = await dbResponse.text()
      console.error('[orders] Supabase insert failed:', error)
      return Response.json({ error: 'Failed to save order' }, { status: 500 })
    }

    console.log('[orders] Order saved:', orderId)

    // Send emails in parallel
    await Promise.all([
      sendCustomerEmail({
        customer_name: name.trim(),
        customer_email: email.trim(),
        items,
        total: totalAmount,
        subtotal,
        tax_amount: taxAmount,
      }),
      sendAdminEmail({
        customer_name: name.trim(),
        customer_email: email.trim(),
        items,
        total: totalAmount,
        subtotal,
        tax_amount: taxAmount,
      }),
    ])

    console.log('[orders] Emails sent for:', orderId)

    return Response.json({ success: true, orderId })
  } catch (error) {
    console.error('[orders] Error:', error)
    return Response.json({ error: 'Failed to process order' }, { status: 500 })
  }
}
