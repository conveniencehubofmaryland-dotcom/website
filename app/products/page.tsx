import type { Metadata } from 'next'
import Link from 'next/link'
import { dbSelect } from '@/lib/db'
import ProductsGrid from '@/components/ProductsGrid'
import { PUBLIC_PRODUCT_SELECT, toPublic, type ProductDbRow } from '@/lib/public-products'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Eco-friendly cleaning, laundry and home convenience products from Convenience Hub of Maryland.',
}

export const dynamic = 'force-dynamic'

// Only products marked Available with stock left are shown. Coming Soon and Out of Stock stay hidden.
export default async function ProductsPage() {
  const rows = await dbSelect<ProductDbRow>('products', {
    select: PUBLIC_PRODUCT_SELECT,
    active: 'eq.true',
    order: 'sort_order.asc',
  })
  const products = toPublic(rows)

  return (
    <div className="bg-white">
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Shop</p>
            <h1 className="font-serif text-5xl md:text-6xl text-chm-black">Products</h1>
            <div className="w-12 h-px bg-chm-red mt-6" />
          </div>
          <Link href="/cart" className="text-xs uppercase tracking-widest text-chm-black hover:text-chm-red">View Cart →</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-12">New products are on the way. Check back soon.</p>
        ) : (
          <ProductsGrid products={products} />
        )}
      </div>
    </div>
  )
}
