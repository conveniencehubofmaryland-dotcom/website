'use client'
import { useState } from 'react'
import { useCart } from '@/lib/CartContext'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { items, total, tax, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const subtotal = total - tax

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.customer_address) {
      alert('Please fill in all fields')
      return
    }

    if (items.length === 0) {
      alert('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone,
        customer_address: form.customer_address,
        order_items: items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax_amount: parseFloat(tax.toFixed(2)),
        total_amount: parseFloat(total.toFixed(2)),
        status: 'Pending Payment',
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit order')
      }

      const data = await res.json()
      clearCart()
      router.push(`/order-confirmation?id=${data.id}`)
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-chm-black mb-4">Your cart is empty</h1>
          <a href="/products" className="text-chm-red font-bold hover:underline">
            Continue shopping
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-4xl text-chm-black mb-12 text-center">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-chm-black mb-4">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chm-red outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="customer_email"
                    value={form.customer_email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chm-red outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleChange}
                    placeholder="202-579-2944"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chm-red outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Address *</label>
                  <input
                    type="text"
                    name="customer_address"
                    value={form.customer_address}
                    onChange={handleChange}
                    placeholder="Street, City, State, ZIP"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chm-red outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-chm-red text-white py-3 font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loading ? 'Submitting...' : 'Submit Order'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-4">
              <h2 className="text-lg font-bold text-chm-black mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6 border-b pb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.title} x{item.qty}</span>
                    <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (6%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-chm-red">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
