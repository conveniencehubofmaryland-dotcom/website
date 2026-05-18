import type { Metadata } from 'next'
import BookingForm from '@/components/BookingForm'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Book a Service',
  description:
    'Book cleaning, laundry, culinary, or care services online. Convenience Hub of Maryland — Maryland, Virginia & D.C.',
}

const SERVICES = [
  { id: 'cleaning',   title: 'Professional Cleaning & Estate Care',           price_from: 'From $100/visit' },
  { id: 'culinary',   title: 'Culinary, Housekeeping & Household Management',  price_from: 'From $50/hr' },
  { id: 'laundry',    title: 'Premium Laundry Pickup & Delivery',              price_from: 'From $3.99/lb' },
  { id: 'care',       title: 'Premium Nanny & Care Services',                  price_from: 'Custom Quote' },
  { id: 'commercial', title: 'Commercial Operations & Special Projects',       price_from: 'Custom Quote' },
]

export default function BookPage() {
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
        <BookingForm services={SERVICES} />
      </div>
    </div>
  )
}
