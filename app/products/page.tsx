'use client'
import { useState, useEffect } from 'react'
import type { Product } from '@/lib/types'

const categories = [
  'All',
  'Cleaning & Eco-Friendly',
  'Laundry & Fabric Care',
  'Home Convenience',
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filtered = selected === 'All' 
    ? products 
    : products.filter(p => p.category === selected)

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50">
    {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="space-y-4 mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-chm-red">
            Premium Selection
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-chm-black">
            Products
          </h1>
          <div className="w-12 h-0.5 bg-chm-black"></div>
          <p className="text-gray-600 text-lg max-w-3xl">
            Carefully curated cleaning, laundry, and home care solutions to simplify your routine.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all ${
                selected === cat
                  ? 'bg-chm-red text-white'
                  : 'bg-white border-2 border-gray-200 text-chm-black hover:border-chm-red'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {loading ? (
          <p className="text-center text-gray-400">Loading products...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-chm-black text-sm leading-tight flex-1">
                      {product.title}
                    </h3>
                    {!product.active && (
                      <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 font-semibold tracking-widest whitespace-nowrap">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">{product.category}</p>

                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div>
                      {product.price ? (
                        <p className="text-lg font-bold text-chm-red">
                          ${product.price}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">Price TBA</p>
                      )}
                    </div>
                    {product.active && (
                      <button className="bg-chm-red text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors">
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
