import type { Metadata } from 'next'
import Link from 'next/link'
import AnimatedSection from '@/components/AnimatedSection'
import ReferralProgram from '@/components/ReferralProgram'
import MembershipSignupForm from '@/components/MembershipSignupForm'
import { dbSelect } from '@/lib/db'
import type { Deal } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Deals, Bundles & Membership | Convenience Hub of Maryland',
  description: 'Save with weekly deals, bundle pricing, and free membership. Priority booking, exclusive discounts, and loyalty rewards for Maryland, Virginia & Washington D.C.',
}

const PERKS = [
  { icon: '★', title: 'Priority Booking',    desc: 'First access to available time slots before the general public.' },
  { icon: '◆', title: 'Exclusive Deals',     desc: 'Member-only weekly deals and promotions on all services.' },
  { icon: '↻', title: 'Recurring Discounts', desc: '2% off all recurring service bookings for active members.' },
  { icon: '✓', title: 'Free Signup',         desc: 'No cost to join — membership is completely free.' },
]

const PREMIUM_PERKS = [
  '15% discount on all services',
  'Priority scheduling',
  'Free upgrade services (quarterly)',
  'Dedicated customer service line',
  'Quarterly loyalty bonus ($20 credit)',
]

const RESIDENTIAL_BUNDLES = [
  {
    name: 'The Essentials Bundle',
    includes: 'Weekly Standard Cleaning + Bi-Weekly Laundry',
    regular: '~$1,500/month',
    bundle: '$1,200/month',
    save: '20%'
  },
  {
    name: 'The Comfort Bundle',
    includes: 'Bi-Weekly Cleaning + Weekly Meal Prep + Monthly Organization',
    regular: '~$3,000/month',
    bundle: '$2,700/month',
    save: '10%'
  },
  {
    name: 'The Luxury Bundle',
    includes: 'Weekly Cleaning + Bi-Weekly Laundry + 3x/Week Meal Prep + Bi-Weekly Nanny + Monthly Organization',
    regular: '~$6,000/month',
    bundle: '$5,400/month',
    save: '10%'
  },
  {
    name: 'Family Care Bundle',
    subtitle: 'With Children',
    includes: 'Weekly Cleaning + Bi-Weekly Childcare (16 hrs) + Weekly Meal Prep + Monthly Organization',
    regular: '~$4,500/month',
    bundle: '$4,050/month',
    save: '10%'
  },
  {
    name: 'Senior Care Bundle',
    subtitle: 'Elderly Parent',
    includes: 'Weekly Cleaning + 20 hrs/week Companion Care + Weekly Meal Prep + Monthly Organization',
    regular: '~$5,000/month',
    bundle: '$4,500/month',
    save: '10%'
  }
]

const COMMERCIAL_BUNDLES = [
  {
    name: 'Small Office Complete',
    includes: '3x/week Janitorial + Weekly Window Cleaning + Monthly Floor Maintenance',
    regular: '~$3,000/month',
    bundle: '$2,700/month',
    save: '10%'
  },
  {
    name: 'Medium Office Premium',
    includes: '5x/week Janitorial + 2x/week Windows + 2x/month Deep Clean + Monthly Floor Maintenance',
    regular: '~$5,000/month',
    bundle: '$4,500/month',
    save: '10%'
  },
  {
    name: 'Enterprise Comprehensive',
    includes: 'Daily Janitorial + Weekly Specialized Services + Monthly Floor Care + Quarterly Deep Clean',
    regular: 'Custom quote',
    bundle: 'Custom quote',
    save: '20%'
  }
]

export default async function DealsPage() {
  const deals = await dbSelect<Deal>('deals', { active: 'eq.true', order: 'sort_order' })

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Save More</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Deals, Bundles &amp; Membership
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Free membership, weekly deals, and bundled pricing — all in one place. Priority booking and exclusive discounts included.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">

        {/* Weekly / Ongoing Deals — from admin */}
        {deals.length > 0 && (
          <AnimatedSection>
            <div className="space-y-8">
              <div>
                <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Right Now</p>
                <h2 className="font-serif text-3xl md:text-4xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                  Current Deals
                </h2>
                <div className="w-12 h-px bg-chm-red mt-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
                {deals.map(deal => (
                  <div key={deal.id} className="bg-white p-6 md:p-8">
                    <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.2em] mb-2">{deal.badge}</p>
                    <p className="font-serif text-xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                      {deal.headline}
                    </p>
                    {deal.detail && <p className="text-gray-500 text-sm leading-relaxed">{deal.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Membership Tiers */}
        <AnimatedSection>
          <div>
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Free to Join</p>
            <h2 className="font-serif text-3xl md:text-4xl text-chm-black mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
              Become a Member
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-gray-100">
            <div className="bg-white p-8 md:p-10">
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Standard</p>
              <h3 className="font-serif text-3xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Free Member
              </h3>
              <p className="text-2xl text-chm-black mb-6">$0<span className="text-sm text-gray-400 font-normal"> / forever</span></p>
              <div className="w-10 h-px bg-chm-red mb-6" />
              <ul className="space-y-3 text-sm text-gray-600 mb-8">
                <li className="flex gap-3"><span className="text-chm-red">✓</span>Priority booking access</li>
                <li className="flex gap-3"><span className="text-chm-red">✓</span>Member-only weekly deals</li>
                <li className="flex gap-3"><span className="text-chm-red">✓</span>2% off all recurring services</li>
                <li className="flex gap-3"><span className="text-chm-red">✓</span>No fees, cancel anytime</li>
              </ul>
            </div>

            <div className="bg-chm-black text-white p-8 md:p-10">
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Premium</p>
              <h3 className="font-serif text-3xl text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Premium Status
              </h3>
              <p className="text-2xl text-white mb-2">Unlocked with</p>
              <p className="text-sm text-gray-400 mb-6">12-month subscription or 12+ services/year</p>
              <div className="w-10 h-px bg-chm-red mb-6" />
              <ul className="space-y-3 text-sm text-gray-300 mb-8">
                {PREMIUM_PERKS.map(p => (
                  <li key={p} className="flex gap-3"><span className="text-chm-red">✓</span>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </AnimatedSection>

        {/* Perks grid */}
        <AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
            {PERKS.map((p, i) => (
              <AnimatedSection key={p.title} delay={i * 60}>
                <div className="bg-white p-8 hover:bg-cream transition-colors h-full">
                  <div className="text-chm-red text-xl mb-4">{p.icon}</div>
                  <p className="font-semibold text-chm-black text-sm uppercase tracking-widest mb-2">{p.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{p.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Residential Bundles */}
        <AnimatedSection>
          <div className="space-y-8">
            <div>
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Save Money with Bundles</p>
              <h2 className="font-serif text-3xl md:text-4xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                Residential Bundles
              </h2>
              <div className="w-12 h-px bg-chm-red mt-4" />
            </div>

            <div className="grid grid-cols-1 gap-px bg-gray-100">
              {RESIDENTIAL_BUNDLES.map((bundle, i) => (
                <div key={i} className="bg-white p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="font-serif text-2xl text-chm-black mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                        {bundle.name}
                      </h3>
                      {bundle.subtitle && (
                        <p className="text-xs text-chm-red uppercase tracking-widest mb-3">{bundle.subtitle}</p>
                      )}
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{bundle.includes}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <span className="text-gray-500">Regular: <span className="text-gray-700 font-medium">{bundle.regular}</span></span>
                        <span className="text-chm-black">Bundle: <span className="font-semibold">{bundle.bundle}</span></span>
                      </div>
                    </div>
                    <div className="shrink-0 bg-cream px-6 py-4 text-center">
                      <p className="text-xs uppercase tracking-widest text-chm-red mb-1">Save</p>
                      <p className="font-serif text-3xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>{bundle.save}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Commercial Bundles */}
        <AnimatedSection>
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                Commercial Bundles
              </h2>
              <div className="w-12 h-px bg-chm-red mt-4" />
            </div>

            <div className="grid grid-cols-1 gap-px bg-gray-100">
              {COMMERCIAL_BUNDLES.map((bundle, i) => (
                <div key={i} className="bg-white p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                        {bundle.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{bundle.includes}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <span className="text-gray-500">Regular: <span className="text-gray-700 font-medium">{bundle.regular}</span></span>
                        <span className="text-chm-black">Bundle: <span className="font-semibold">{bundle.bundle}</span></span>
                      </div>
                    </div>
                    <div className="shrink-0 bg-cream px-6 py-4 text-center">
                      <p className="text-xs uppercase tracking-widest text-chm-red mb-1">Save</p>
                      <p className="font-serif text-3xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>{bundle.save}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* First-Time Specials */}
        <AnimatedSection>
          <div className="bg-cream p-8 md:p-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">New Customers</p>
            <h2 className="font-serif text-3xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              First-Time Customer Specials
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 text-sm">
              <div className="bg-white p-6 border border-gray-100">
                <p className="font-mono text-chm-red text-lg mb-2">LAUNDRY15</p>
                <p className="text-gray-600">15% off first laundry service</p>
              </div>
              <div className="bg-white p-6 border border-gray-100">
                <p className="font-mono text-chm-red text-lg mb-2">CLEANING15</p>
                <p className="text-gray-600">15% off first cleaning service (min. $150)</p>
              </div>
              <div className="bg-white p-6 border border-gray-100">
                <p className="font-mono text-chm-red text-lg mb-2">WELCOME2024</p>
                <p className="text-gray-600">10% off first service (all other services)</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <ReferralProgram />

        {/* Referral + Military */}
        <AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
            <div className="bg-white p-8">
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Refer a Friend</p>
              <h3 className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                Earn $20 Credit
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                You earn $20 credit per qualified referral. Your friend gets 10% off their first service. Unlimited referrals, no cap.
              </p>
            </div>
            <div className="bg-white p-8">
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Military Discount</p>
              <h3 className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                15% OFF All Services
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                We proudly offer 15% discount across board for all active duty and veterans. Military ID required.
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Payment & Billing / Cancellation */}
        <AnimatedSection>
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-3xl text-chm-black mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
                Payment &amp; Billing
              </h2>
              <div className="grid sm:grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-chm-red mb-3">Accepted Methods</p>
                  <ul className="space-y-2 text-gray-600">
                    <li>Credit/Debit Card (Visa, Mastercard, Amex)</li>
                    <li>Bank Transfer/ACH</li>
                    <li>Check (contracts only)</li>
                    <li>Zelle: conveniencehubofmaryland@gmail.com</li>
                    <li>Direct Deposit via <a href="https://link.clover.com/urlshortener/m92Kg8" className="text-chm-red underline">Clover</a></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-chm-red mb-3">Invoicing</p>
                  <ul className="space-y-2 text-gray-600">
                    <li><span className="font-semibold text-chm-black">One-time:</span> Invoice at completion</li>
                    <li><span className="font-semibold text-chm-black">Recurring:</span> Monthly invoice, due within 15 days</li>
                    <li><span className="font-semibold text-chm-black">Contracts:</span> 5% discount for prepayment</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-10">
              <h3 className="font-serif text-2xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Cancellation Policy
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-semibold text-chm-black">Notice</th>
                      <th className="text-left py-3 font-semibold text-chm-black">Charge</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="py-3">More than 48 hours</td>
                      <td className="py-3">No charge, full refund available</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">24–48 hours</td>
                      <td className="py-3">50% of service price</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3">Less than 24 hours</td>
                      <td className="py-3">100% of service price</td>
                    </tr>
                    <tr>
                      <td className="py-3">No-show</td>
                      <td className="py-3">100% charged</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Membership Signup Form */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Sign Up</p>
            <h2 className="font-serif text-3xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Join Today
            </h2>
            <div className="w-10 h-px bg-chm-red mb-8" />
            <MembershipSignupForm />
          </div>
        </AnimatedSection>

        {/* CTA */}
        {/* CTA */}
        <AnimatedSection>
          <div className="bg-chm-black text-white p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="font-serif text-3xl text-white" style={{ fontFamily: 'var(--font-serif)' }}>
              Experience Us Today!
            </p>
            <Link
              href="/contact"
              className="shrink-0 bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </AnimatedSection>

        <p className="text-xs text-gray-400 leading-relaxed">
          * Bundle pricing valid for recurring monthly contracts. Cannot be combined unless specified. Military ID required for discount. Contact us at 202-579-2944 to redeem.
        </p>
      </div>
    </div>
  )
}
