import type { Metadata } from 'next'
import AnimatedSection from '@/components/AnimatedSection'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Weekly Deals | Convenience Hub of Maryland',
  description:
    'Weekly deals on laundry, cleaning, and home services. Discounts for nurses, students, expectant mothers, and bulk laundry orders.',
}

const DEALS = [
  {
    badge: 'Monday Deal',
    headline: '$20 Flat — 10 lbs Colored Laundry',
    detail: 'Economy 1-week turnaround delivery. Pay just $20 for 10 lbs of colored laundry — our lowest rate of the week.',
  },
  {
    badge: 'Wednesday Deal',
    headline: '5% OFF for Nurses, Students & Expectant Mothers',
    detail: 'We appreciate healthcare workers, active students, and expectant mothers. Show valid ID to redeem 5% off premium services.',
  },
  {
    badge: 'Weekend Deal',
    headline: '3% OFF Bulk Laundry — 100+ lbs',
    detail: 'Scale up and save. Any laundry order of 100 lbs or more on Saturday or Sunday receives 3% off automatically.',
  },
  {
    badge: 'Members Only',
    headline: 'FREE Signup + 2% Off All Recurring Services',
    detail: 'Join the CHM network for free and lock in a permanent 2% discount on all recurring monthly service contracts. No expiry, no catches.',
  },
]

export default function DealsPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Save More</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            This Week&apos;s Deals
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Special pricing every week. Contact us to redeem before booking.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
          {DEALS.map((d, i) => (
            <AnimatedSection key={i} delay={i * 80}>
              <div className="bg-white p-8 hover:bg-cream transition-colors h-full">
                <span className="text-xs font-semibold uppercase tracking-widest text-chm-red border border-chm-red/30 px-3 py-1 inline-block mb-5">
                  {d.badge}
                </span>
                <h2 className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                  {d.headline}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">{d.detail}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection>
          <div className="bg-chm-black text-white p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.2em] mb-3">Free to Join</p>
              <p className="font-serif text-3xl text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Become a Member
              </p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Free signup. 2% off all recurring services. No expiry, no catches.
              </p>
            </div>
            <a
              href="https://wa.me/12025792944"
              className="shrink-0 bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Sign Up via WhatsApp
            </a>
          </div>
        </AnimatedSection>

        <p className="text-xs text-gray-400 leading-relaxed">
          * Deals valid for the current week only unless stated as ongoing. Cannot be combined unless specified. Contact us at 202-579-2944 to redeem.
        </p>
      </div>
    </div>
  )
}
