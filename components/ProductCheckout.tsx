'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CloverCardForm from '@/components/CloverCardForm'
import { type CartLine, readCart } from '@/lib/cart'

type Product = { id: string; title: string; price: number | null }

const inputCls = 'w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red'

export default function ProductCheckout() {
  const [lines, setLines] = useState<CartLine[]>([])
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    setLines(readCart())
    let cancelled = false
    fetch('/api/products', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((list: Product[]) => {
        if (!cancelled) setProducts(Object.fromEntries(list.map(p => [p.id, p])))
      })
      .catch(() => {
        if (!cancelled) setLoadError('We could not load prices right now. Please refresh the page.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="text-gray-500 py-12 text-center">Loading your order…</p>
  if (loadError) return <p className="text-sm text-chm-red py-12 text-center">{loadError}</p>

  const priced = lines.map(l => ({ line: l, product: products[l.id] }))
  const allAvailable = priced.length > 0 && priced.every(r => r.product && r.product.price != null)
  const total = priced.reduce((sum, r) => sum + (r.product?.price != null ? Number(r.product.price) * r.line.qty : 0), 0)

  if (!allAvailable) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-6">Your cart needs a review before checkout. Some items are no longer available.</p>
        <Link href="/cart" className="bg-chm-red text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-red-700">Review Cart</Link>
      </div>
    )
  }

  const contactReady = name.trim().length > 1 && email.includes('@') && phone.trim().length >= 7

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">Your Details</h2>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Full name</label>
          <input value={name} onChange={e => setName(e.target.value)} className={inputCls} autoComplete="name" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} autoComplete="tel" />
        </div>

        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3 pt-6">Order Summary</h2>
        {priced.map(({ line, product }) => (
          <div key={line.id} className="flex justify-between text-sm">
            <span>{product?.title} × {line.qty}</span>
            <span>${((Number(product?.price) || 0) * line.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-semibold text-chm-black pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">Payment</h2>
        {contactReady ? (
          <CloverCardForm
            kind="full"
            amount={total}
            category="products"
            selections={{}}
            contact={{ name: name.trim(), email: email.trim(), phone: phone.trim() }}
            productItems={lines.map(l => ({ id: l.id, qty: l.qty }))}
          />
        ) : (
          <p className="text-sm text-gray-500">Enter your name, email and phone to continue to payment.</p>
        )}
      </div>
    </div>
  )
}
