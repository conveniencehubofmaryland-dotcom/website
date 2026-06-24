import type { Metadata } from 'next'
import Link from 'next/link'
import { dbSelect } from '@/lib/db'
import type { Review } from '@/lib/types'
import AnimatedSection from '@/components/AnimatedSection'
import ReviewForm from '@/components/ReviewForm'
import SuccessStories from '@/components/SuccessStories'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Customer Reviews | Convenience Hub of Maryland',
  description: 'Read real reviews from Maryland, Virginia & DC customers. 5-star rated cleaning, laundry, culinary, and care services.',
  alternates: {
    canonical: 'https://www.conveniencehubofmaryland.com/reviews',
  },
}

export default async function ReviewsPage() {
  const reviews = await dbSelect<Review>('reviews', { 
    approved: 'eq.true', 
    order: 'created_at.desc',
    select: 'id,customer_name,rating,body,service_mentioned,created_at'
  })

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
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-xl leading-none">★★★★★</span>
            <span className="text-chm-black/70 text-sm font-medium">5.0 Average Rating</span>
          </div>
        </div>
      </div>

      {/* Success Stories - Moved from Home */}
      <SuccessStories />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">
        
        {/* Reviews Grid */}
        {reviews && reviews.length > 0 ? (
          <div className="space-y-8">
            <AnimatedSection>
              <h2 className="font-serif text-3xl md:text-4xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                What Our Customers Say
              </h2>
              <div className="w-12 h-px bg-chm-red mt-4" />
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
              {reviews.map((review, i) => (
                <AnimatedSection key={review.id} delay={i * 60}>
                  <div className="bg-white p-8 hover:bg-blush transition-colors h-full flex flex-col gap-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} className={j < review.rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed flex-1 font-light">
                      &ldquo;{review.body}&rdquo;
                    </p>
                    <div>
                      <p className="text-chm-black font-semibold text-sm">{review.customer_name}</p>
                      {review.service_mentioned && (
                        <p className="text-chm-red text-xs uppercase tracking-widest mt-0.5">{review.service_mentioned}</p>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        ) : (
          <AnimatedSection>
            <div className="text-center py-12">
              <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
            </div>
          </AnimatedSection>
        )}

        {/* Leave a Review Form */}
        <AnimatedSection>
          <div className="bg-cream p-8 md:p-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Share Your Experience</p>
            <h2 className="font-serif text-3xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Leave a Review
            </h2>
            <ReviewForm />
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection>
          <div className="bg-chm-black text-white p-10 text-center">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.2em] mb-3">Ready to Experience CHM?</p>
            <p className="font-serif text-3xl text-white mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Book Your First Service
            </p>
            <Link
              href="/book"
              className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </AnimatedSection>

      </div>
    </div>
  )
}
