import type { Metadata } from 'next'
import { dbSelect } from '@/lib/db'
import type { Service } from '@/lib/types'
import BookingForm from '@/components/BookingForm'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Book a Service',
  description:
    'Book cleaning, laundry, culinary, or care services online. Convenience Hub of Maryland — Maryland, Virginia & D.C.',
}

export default async function BookPage() {
  const services = await dbSelect<Service>('services', {
    active: 'eq.true',
    order: 'sort_order',
    select: 'id,title,price_from',
  })

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Get Started</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Book a Service
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Fill out the form below. We&apos;ll confirm your booking within 1 hour during business hours (Mon–Sat, 9 AM–9 PM).
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16">
        <BookingForm services={(services ?? [])} />
      </div>
    </div>
  )
}
