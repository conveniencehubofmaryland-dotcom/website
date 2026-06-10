'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-cream/50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Thank You Message */}
          <h1 className="font-serif text-4xl text-chm-black mb-4">
            Thank You for Your Order!
          </h1>

          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order ID: <span className="font-mono font-bold">{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}

          {/* Key Message */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 text-left">
            <p className="text-chm-black font-semibold mb-3">
              We'll review it and email you a secure payment link via Zelle or CashApp within 1 business day.
            </p>
            <p className="text-gray-600 text-sm">
              Your order will ship once payment is received. We appreciate your business!
            </p>
          </div>

          {/* What to Expect */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-bold text-chm-black mb-4">What Happens Next:</h2>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold text-chm-red">1.</span>
                <span>We receive and review your order</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-chm-red">2.</span>
                <span>Email you a payment link via Zelle or CashApp</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-chm-red">3.</span>
                <span>Process payment and prepare your order</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-chm-red">4.</span>
                <span>Ship to your address (tracking provided)</span>
              </li>
            </ol>
          </div>

          {/* Contact Info */}
          <div className="mb-8 text-sm text-gray-600">
            <p className="mb-2">Have questions? Contact us:</p>
            <p className="font-semibold text-chm-black">
              📞 202-579-2944 | 📧 conveniencehubofmaryland@gmail.com
            </p>
          </div>

          {/* Action Button */}
          <div className="space-y-4">
            <Link 
              href="/products"
              className="inline-block bg-chm-red text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-red-700 transition rounded"
            >
              Continue Shopping
            </Link>
            <div>
              <Link 
                href="/"
                className="text-chm-red font-semibold hover:underline text-sm"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
