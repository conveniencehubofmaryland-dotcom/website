'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { addToCart, CART_EVENT, readCart } from '@/lib/cart'

export type PublicProduct = {
  id: string
  sku: string
  title: string
  category: string
  description: string | null
  price: number | null
  image_url: string | null
  image_urls: string[] | null
  weight_lb: number | null
  sort_order: number
  colours: string[]
  sizes: string[]
  material: string | null
  dimensions: string | null
  care: string | null
}

export function photosOf(p: PublicProduct): string[] {
  if (p.image_urls && p.image_urls.length) return p.image_urls
  return p.image_url ? [p.image_url] : []
}

function ProductCard({ p }: { p: PublicProduct }) {
  const photos = photosOf(p)
  const [main, setMain] = useState(0)
  const [added, setAdded] = useState(false)
  const [colour, setColour] = useState('')
  const [size, setSize] = useState('')
  const needsColour = p.colours.length > 0
  const needsSize = p.sizes.length > 0
  const chosen = (!needsColour || colour !== '') && (!needsSize || size !== '')

  function add() {
    if (!chosen) return
    addToCart(p.id, needsColour ? colour : null, needsSize ? size : null)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const selectCls = 'w-full border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-chm-red'

  return (
    <div className="border border-gray-100 rounded overflow-hidden bg-white flex flex-col">
      {photos.length > 0 ? (
        <img src={photos[main] ?? photos[0]} alt={p.title} className="w-full h-56 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-56 bg-cream" />
      )}
      {photos.length > 1 && (
        <div className="flex gap-2 p-2 overflow-x-auto">
          {photos.map((url, i) => (
            <button key={url + i} type="button" onClick={() => setMain(i)}
              className={`shrink-0 border ${i === main ? 'border-chm-red' : 'border-gray-200'}`} aria-label={`Photo ${i + 1}`}>
              <img src={url} alt="" className="w-14 h-14 object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">{p.category}</p>
        <h2 className="font-serif text-xl text-chm-black mt-1">{p.title}</h2>
        {p.description && <p className="text-sm text-gray-500 mt-2 leading-relaxed whitespace-pre-line">{p.description}</p>}
        {(p.material || p.dimensions || p.care) && (
          <dl className="text-xs text-gray-600 mt-3 space-y-1">
            {p.material && <div><dt className="inline font-semibold">Material: </dt><dd className="inline">{p.material}</dd></div>}
            {p.dimensions && <div><dt className="inline font-semibold">Dimensions: </dt><dd className="inline">{p.dimensions}</dd></div>}
            {p.care && <div><dt className="inline font-semibold">Care: </dt><dd className="inline whitespace-pre-line">{p.care}</dd></div>}
          </dl>
        )}
        {(needsColour || needsSize) && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {needsColour && (
              <label className="text-xs">
                <span className="block uppercase tracking-widest text-gray-500 mb-1">Colour</span>
                <select value={colour} onChange={e => setColour(e.target.value)} className={selectCls}>
                  <option value="">Choose</option>
                  {p.colours.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
            )}
            {needsSize && (
              <label className="text-xs">
                <span className="block uppercase tracking-widest text-gray-500 mb-1">Size</span>
                <select value={size} onChange={e => setSize(e.target.value)} className={selectCls}>
                  <option value="">Choose</option>
                  {p.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            )}
          </div>
        )}
        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          <span className="font-semibold text-chm-black">{p.price != null ? `$${Number(p.price).toFixed(2)}` : 'Call for price'}</span>
          <button type="button" onClick={add} disabled={p.price == null || !chosen}
            className="bg-chm-red text-white px-5 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
            {added ? 'Added ✓' : chosen ? 'Add to Cart' : 'Choose options'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Stays on screen while the cart has items, so the way to the cart is always visible.
function CartBar() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const refresh = () => setCount(readCart().reduce((sum, l) => sum + l.qty, 0))
    refresh()
    window.addEventListener(CART_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CART_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (count === 0) return null
  return (
    <div className="sticky top-20 z-30 mb-8 flex items-center justify-between gap-4 bg-chm-black text-white px-5 py-4 shadow-lg">
      <span className="text-sm">{count} item{count === 1 ? '' : 's'} in your cart</span>
      <Link href="/cart" className="bg-chm-red text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700">
        View Cart
      </Link>
    </div>
  )
}

export default function ProductsGrid({ products }: { products: PublicProduct[] }) {
  return (
    <>
      <CartBar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </>
  )
}
