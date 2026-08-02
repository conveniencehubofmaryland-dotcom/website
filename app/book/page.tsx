import { Suspense } from 'react'
import MergedQuoteBookingForm from '@/components/MergedQuoteBookingForm'

export const metadata = {
  title: 'Quote & Book | Convenience Hub of Maryland',
  description: 'Get an instant quote and book your service with Convenience Hub.',
}

export default function BookPage() {
  const initial = {
    name: '',
    email: '',
    phone: '',
    serviceId: '',
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
            <h1 className="font-serif text-4xl md:text-5xl text-chm-black mb-4">Get Your Quote</h1>
            <p className="text-gray-600 text-lg">Select a service, tell us more, and get an instant estimate. Book with confidence.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
          <Suspense fallback={<div className="text-center py-12"><p className="text-gray-600">Loading form...</p></div>}>
            <MergedQuoteBookingForm initial={initial} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
