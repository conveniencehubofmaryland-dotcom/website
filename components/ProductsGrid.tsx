'use client'

import { useState } from 'react'
import Link from 'next/link'
import { addToCart } from '@/lib/cart'

export type PublicProduct = {
  id: string
  sku: string
  title: string
  category: string
  description: string | null
  price: number | null
  image_url: string | null
  sort_order: number
}

export default function ProductsGrid({ products }: { products: PublicProduct[] }) {
  const [added, setAdded] = useState<string | null>(null)

  function add(id: string) {
    addToCart(id)
    setAdded(id)
    setTimeout(() => setAdded(current => (current === id ? null : current)), 1500)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map(p => (
        <div key={p.id} className="border border-gray-100 rounded overflow-hidden bg-white flex flex-col">
          {p.image_url ? (
            <img src={p.image_url} alt={p.title} className="w-full h-56 object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-56 bg-cream" />
          )}
          <div className="p-5 flex flex-col flex-1">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">{p.category}</p>
            <h2 className="font-serif text-xl text-chm-black mt-1">{p.title}</h2>
            {p.description && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{p.description}</p>}
            <div className="mt-auto pt-5 flex items-center justify-between gap-3">
              <span className="font-semibold text-chm-black">{p.price != null ? `$${Number(p.price).toFixed(2)}` : 'Call for price'}</span>
              <button
                type="button"
                onClick={() => add(p.id)}
                disabled={p.price == null}
                className="bg-chm-red text-white px-5 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {added === p.id ? 'Added ✓' : 'Add to Cart'}
              </button>
            </div>
            {added === p.id && (
              <Link href="/cart" className="text-xs text-chm-red underline mt-3">View cart</Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
