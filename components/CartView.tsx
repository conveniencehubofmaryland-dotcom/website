'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CART_EVENT, type CartLine, readCart, removeFromCart, setQty } from '@/lib/cart'

type Product = { id: string; title: string; price: number | null; image_url: string | null }

export default function CartView() {
  const [lines, setLines] = useState<CartLine[]>([])
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(() => setLines(readCart()), [])

  useEffect(() => {
    refresh()
    window.addEventListener(CART_EVENT, refresh)
    window.addEventListener('storage', refresh)
    let cancelled = false
    fetch('/api/products', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((list: Product[]) => {
        if (cancelled) return
        setProducts(Object.fromEntries(list.map(p => [p.id, p])))
      })
      .catch(() => {
        if (!cancelled) setError('We could not load prices right now. Please refresh the page.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
      window.removeEventListener(CART_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  const rows = lines.map(l => ({ line: l, product: products[l.id] }))
  const available = rows.filter(r => r.product && r.product.price != null)
  const total = available.reduce((sum, r) => sum + Number(r.product!.price) * r.line.qty, 0)
  const allAvailable = rows.length > 0 && available.length === rows.length

  if (loading) return <p className="text-gray-500 py-12 text-center">Loading your cart…</p>

  if (lines.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-6">Your cart is empty.</p>
        <Link href="/products" className="bg-chm-red text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-red-700">Shop Products</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-chm-red">{error}</p>}
      {rows.map(({ line, product }) => (
        <div key={line.id} className="flex gap-4 items-center border-b border-gray-100 pb-6">
          {product?.image_url && <img src={product.image_url} alt="" className="w-20 h-20 object-cover" />}
          <div className="flex-1">
            {product ? (
              <>
                <p className="font-semibold text-chm-black">{product.title}</p>
                {product.price != null ? (
                  <p className="text-sm text-gray-500">${Number(product.price).toFixed(2)} each</p>
                ) : (
                  <p className="text-sm text-chm-red">No longer available</p>
                )}
              </>
            ) : (
              <p className="text-sm text-chm-red">This item is no longer available.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setQty(line.id, line.qty - 1)} className="w-8 h-8 border border-gray-200">−</button>
            <span className="w-8 text-center text-sm">{line.qty}</span>
            <button type="button" onClick={() => setQty(line.id, line.qty + 1)} className="w-8 h-8 border border-gray-200">+</button>
          </div>
          <div className="w-20 text-right font-semibold text-sm">
            {product?.price != null ? `$${(Number(product.price) * line.qty).toFixed(2)}` : '—'}
          </div>
          <button type="button" onClick={() => removeFromCart(line.id)} className="text-xs text-gray-400 hover:text-chm-red">Remove</button>
        </div>
      ))}

      <div className="flex items-center justify-between pt-4">
        <p className="font-semibold text-chm-black">Total: ${total.toFixed(2)}</p>
        <div className="text-right">
          <Link href="/checkout" className="inline-block bg-chm-red text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-red-700">Checkout</Link>
          {!allAvailable && (
            <p className="text-xs text-chm-red mt-2">Remove the items marked &quot;No longer available&quot; before you pay.</p>
          )}
        </div>
      </div>
    </div>
  )
}
