import type { Metadata } from 'next'
import ProductCheckout from '@/components/ProductCheckout'

export const metadata: Metadata = {
  title: 'Checkout | Convenience Hub of Maryland',
  robots: { index: false, follow: false },
}

export default function CheckoutPage() {
  return (
    <div className="bg-white">
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Shop</p>
          <h1 className="font-serif text-4xl md:text-5xl text-chm-black">Checkout</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
        <ProductCheckout />
      </div>
    </div>
  )
}
