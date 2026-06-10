'use client'
import { useCart } from '@/lib/CartContext'
import Link from 'next/link'

export default function CartModal() {
  const { items, removeItem, updateQty, total, tax } = useCart()
  const subtotal = total - tax

  if (items.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg">
      <h2 className="text-xl font-bold text-chm-black mb-4">Shopping Cart</h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto border-b pb-4">
        {items.map(item => (
          <div key={item.id} className="flex gap-4 pb-4 border-b">
            <div className="flex-1">
              <p className="font-semibold text-sm text-chm-black">{item.title}</p>
              <p className="text-xs text-gray-500">{item.sku}</p>
              <p className="text-sm font-bold text-chm-red">${item.price}/ea</p>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                className="w-12 px-2 py-1 border border-gray-200 text-sm rounded"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="text-xs text-red-600 hover:text-red-800 font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 mb-6 border-b pb-4">
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

      {/* Checkout Button */}
      <Link href="/checkout" className="block w-full bg-chm-red text-white text-center py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition">
        Proceed to Checkout
      </Link>
    </div>
  )
}
