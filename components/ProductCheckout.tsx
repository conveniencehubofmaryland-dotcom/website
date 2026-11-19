'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import CloverCardForm from '@/components/CloverCardForm'
import { CART_EVENT, type CartLine, clearCart, readCart } from '@/lib/cart'
import { quoteOrder, SHIPPING_TIERS, type Fulfillment } from '@/lib/shop-pricing'
import { pickupInstructions } from '@/lib/shop-config'

type Product = { id: string; title: string; price: number | null; weight_lb: number | null }

const inputCls = 'w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red'
const labelCls = 'block text-xs uppercase tracking-widest text-gray-500 mb-1'

export default function ProductCheckout() {
  const [lines, setLines] = useState<CartLine[]>([])
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup')
  const [addr, setAddr] = useState({ line1: '', line2: '', city: '', state: '', zip: '' })
  const [paidMessage, setPaidMessage] = useState('')

  useEffect(() => {
    const refreshCart = () => setLines(readCart())
    refreshCart()
    window.addEventListener(CART_EVENT, refreshCart)
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
      window.removeEventListener(CART_EVENT, refreshCart)
    }
  }, [])

  const priced = useMemo(() => lines.map(l => ({ line: l, product: products[l.id] })), [lines, products])
  const allAvailable = priced.length > 0 && priced.every(r => r.product && r.product.price != null)

  // Same rules as the server. The server recalculates everything when the card is charged.
  const quote = useMemo(() => {
    if (!allAvailable) return null
    return quoteOrder(
      priced.map(r => ({
        price: Number(r.product!.price),
        qty: r.line.qty,
        weight_lb: r.product!.weight_lb == null ? null : Number(r.product!.weight_lb),
      })),
      fulfillment
    )
  }, [allAvailable, priced, fulfillment])

  // After a confirmed payment, show the receipt message. The cart was cleared at that moment.
  if (paidMessage) {
    return (
      <div className="text-center py-12 space-y-6">
        <p className="text-green-700 font-semibold">{paidMessage}</p>
        <Link href="/products" className="text-xs uppercase tracking-widest text-chm-red underline">Back to products</Link>
      </div>
    )
  }
  if (loading) return <p className="text-gray-500 py-12 text-center">Loading your order…</p>
  if (loadError) return <p className="text-sm text-chm-red py-12 text-center">{loadError}</p>

  if (!allAvailable) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-6">Your cart needs a review before checkout. Some items are no longer available.</p>
        <Link href="/cart" className="bg-chm-red text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-red-700">Review Cart</Link>
      </div>
    )
  }

  const contactReady = name.trim().length > 1 && email.includes('@') && phone.trim().length >= 7
  const addressReady = fulfillment === 'pickup' || (
    addr.line1.trim().length >= 3 && addr.city.trim() && /^[A-Za-z]{2}$/.test(addr.state.trim()) && /^\d{5}(-\d{4})?$/.test(addr.zip.trim())
  )
  const canShipOnline = quote?.canShip ?? false
  const ready = contactReady && addressReady && canShipOnline && quote != null

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">Your Details</h2>
        <div>
          <label className={labelCls}>Full name</label>
          <input value={name} onChange={e => setName(e.target.value)} className={inputCls} autoComplete="name" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} autoComplete="tel" />
        </div>

        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3 pt-6">How would you like to receive your order?</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="radio" name="fulfillment" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} className="mt-1" />
          <span className="text-sm"><strong>Pickup</strong><br /><span className="text-gray-500">{pickupInstructions()}</span></span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="radio" name="fulfillment" checked={fulfillment === 'ship'} onChange={() => setFulfillment('ship')} className="mt-1" />
          <span className="text-sm"><strong>Ship to me</strong><br /><span className="text-gray-500">Shipping is added to your total below.</span></span>
        </label>

        {fulfillment === 'ship' && (
          <div className="space-y-3 border border-gray-200 p-4 bg-cream">
            <div>
              <label className={labelCls}>Street address</label>
              <input value={addr.line1} onChange={e => setAddr({ ...addr, line1: e.target.value })} className={inputCls} autoComplete="address-line1" />
            </div>
            <div>
              <label className={labelCls}>Apartment, suite (optional)</label>
              <input value={addr.line2} onChange={e => setAddr({ ...addr, line2: e.target.value })} className={inputCls} autoComplete="address-line2" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className={labelCls}>City</label>
                <input value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} className={inputCls} autoComplete="address-level2" />
              </div>
              <div className="col-span-1">
                <label className={labelCls}>State</label>
                <input value={addr.state} maxLength={2} onChange={e => setAddr({ ...addr, state: e.target.value.toUpperCase() })} className={inputCls} autoComplete="address-level1" />
              </div>
              <div className="col-span-1">
                <label className={labelCls}>ZIP</label>
                <input value={addr.zip} maxLength={10} onChange={e => setAddr({ ...addr, zip: e.target.value })} className={inputCls} autoComplete="postal-code" />
              </div>
            </div>
            {!canShipOnline && (
              <p className="text-sm text-chm-red">
                This order is too heavy to ship online. Please call 202-579-2944 to arrange shipping, or choose pickup.
              </p>
            )}
            <p className="text-xs text-gray-400">Shipping is flat by total weight: up to {SHIPPING_TIERS[SHIPPING_TIERS.length - 1].maxLb} lb.</p>
          </div>
        )}

        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3 pt-6">Order Summary</h2>
        {priced.map(({ line, product }) => (
          <div key={line.id} className="flex justify-between text-sm">
            <span>{product?.title} × {line.qty}</span>
            <span>${((Number(product?.price) || 0) * line.qty).toFixed(2)}</span>
          </div>
        ))}
        {quote && quote.shipping > 0 && (
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>${quote.shipping.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-chm-black pt-2 border-t border-gray-100">
          <span>Total</span>
          <span>${(quote?.total ?? 0).toFixed(2)}</span>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">Payment</h2>
        {!contactReady && <p className="text-sm text-gray-500">Enter your name, email and phone to continue.</p>}
        {contactReady && !addressReady && <p className="text-sm text-gray-500">Enter your shipping address to continue.</p>}
        {ready && quote && (
          <CloverCardForm
            kind="full"
            amount={quote.total}
            category="products"
            selections={{}}
            contact={{ name: name.trim(), email: email.trim(), phone: phone.trim() }}
            productOrder={{
              items: lines.map(l => ({ id: l.id, qty: l.qty })),
              fulfillment,
              shipTo: fulfillment === 'ship' ? { ...addr } : null,
              onPaid: msg => {
                clearCart()
                setPaidMessage(msg)
              },
            }}
          />
        )}
      </div>
    </div>
  )
}
