import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: 'Missing config' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        customer_address: body.customer_address,
        order_items: body.order_items,
        subtotal: body.subtotal,
        tax_amount: body.tax_amount,
        total_amount: body.total_amount,
        status: 'Pending Payment',
      }])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: 'Database error' }, { status: 400 })
    }

    const orderId = data[0]?.id || 'unknown'

    return Response.json({ 
      success: true, 
      orderId 
    })

  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
