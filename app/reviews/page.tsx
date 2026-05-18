import type { Metadata } from 'next'
import Link from 'next/link'
import { dbSelect } from '@/lib/db'
import type { Review, Service } from '@/lib/types'
import AnimatedSection from '@/components/AnimatedSection'
import ReviewForm from '@/components/ReviewForm'


export const metadata: Metadata = {
  title: 'Customer Reviews',
  description:
    'Read reviews from real customers of Convenience Hub of Maryland — professional cleaning, laundry, culinary, and care services in the DMV.',
}

export default async function ReviewsPage() {
  const [reviews, services] = await Promise.all([
    dbSelect<Review>('reviews', { approved: 'eq.true', order: 'created_at.desc' }),
    dbSelect<Service>('services', { active: 'eq.true', order: 'sort_order', select: 'id,title' }),
  ])

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Testimonials</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Customer Reviews
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          {avg ? (
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-lg leading-none">{'★'.repeat(Math.round(Number(avg)))}</span>
              <span className="text-chm-black font-semibold">{avg}</span>
              <span className="text-gray-400 text-sm">/ 5 &nbsp;·&nbsp; {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          ) : (
            <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
              Be the first to share your experience.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">

        {/* Review grid */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
            {reviews.map((r, i) => (
              <AnimatedSection key={r.id} delay={i * 50}>
                <div className="bg-white p-8 hover:bg-cream transition-colors h-full flex flex-col gap-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} className={j < r.rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 font-light">&ldquo;{r.body}&rdquo;</p>
                  <div>
                    <p className="text-chm-black font-semibold text-sm">{r.customer_name}</p>
                    {r.service_mentioned && (
                      <p className="text-chm-red text-xs uppercase tracking-widest mt-0.5">{r.service_mentioned}</p>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}

        {/* Submit form */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-14">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Share Your Experience</p>
            <h2 className="font-serif text-3xl text-chm-black mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
              Leave a Review
            </h2>
            <ReviewForm services={services.map(s => ({ id: s.id, title: s.title }))} />
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-serif text-2xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                Ready to experience it yourself?
              </p>
              <p className="text-gray-500 text-sm mt-1">Book a service today — Mon–Sat, 9 AM–9 PM.</p>
            </div>
            <Link
              href="/book"
              className="bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Book Now
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
