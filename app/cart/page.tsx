'use client'
import { useCart } from '@/lib/CartContext'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQty, total, tax, clearCart } = useCart()
  const subtotal = total - tax

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-chm-black mb-4">Your cart is empty</h1>
          <Link href="/products" className="text-chm-red font-bold hover:underline text-lg">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="font-serif text-4xl text-chm-black mb-12 text-center">Shopping Cart</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 pb-6 border-b last:border-b-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-chm-black">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.sku}</p>
                    <p className="text-lg font-bold text-chm-red mt-2">${item.price}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3 items-end">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-200 text-sm rounded"
                      />
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-semibold text-chm-black">
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link 
              href="/products"
              className="inline-block mt-6 text-chm-red font-semibold hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-chm-black mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 border-b pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (6% MD):</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-chm-red">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link 
                href="/checkout"
                className="block w-full bg-chm-red text-white text-center py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition mb-3"
              >
                Proceed to Checkout
              </Link>

              <button
                onClick={clearCart}
                className="w-full text-chm-red border border-chm-red py-2 font-semibold hover:bg-red-50 transition"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
