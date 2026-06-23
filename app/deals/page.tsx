import type { Metadata } from 'next'
import Link from 'next/link'
import AnimatedSection from '@/components/AnimatedSection'
import ReferralProgram from '@/components/ReferralProgram'
import { dbSelect } from '@/lib/db'
import type { Deal } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Weekly Deals | Convenience Hub of Maryland',
  description:
    'Weekly deals on laundry, cleaning, and home services. Discounts for nurses, students, expectant mothers, and bulk laundry orders.',
}

const STATIC_DEALS: Deal[] = [
  { id: '1', sort_order: 1, active: true, created_at: '', badge: 'Residential Bundle', headline: 'The Essentials Bundle', detail: 'Weekly Standard Cleaning + Bi-Weekly Laundry. Regular: ~$850/mo. Bundle: $750/mo. Save: 15%' },
  { id: '2', sort_order: 2, active: true, created_at: '', badge: 'Residential Bundle', headline: 'The Comfort Bundle', detail: 'Bi-Weekly Cleaning + Weekly Meal Prep + Monthly Organization. Regular: ~$1,100/mo. Bundle: $900/mo. Save: 18%' },
  { id: '3', sort_order: 3, active: true, created_at: '', badge: 'Residential Bundle', headline: 'The Luxury Bundle', detail: 'Weekly Cleaning + Bi-Weekly Laundry + 3x/Week Meal Prep + Bi-Weekly Nanny + Monthly Organization. Regular: ~$6,000/mo. Bundle: $5,000/mo. Save: 20%' },
  { id: '4', sort_order: 4, active: true, created_at: '', badge: 'Family Bundle', headline: 'Family Care Bundle', detail: 'Weekly Cleaning + Bi-Weekly Childcare (16 hrs) + Weekly Meal Prep + Monthly Organization. Regular: ~$3,500/mo. Bundle: $3,000/mo. Save: 20%' },
  { id: '5', sort_order: 5, active: true, created_at: '', badge: 'Senior Bundle', headline: 'Senior Care Bundle', detail: 'Weekly Cleaning + 20 hrs/week Companion Care + Weekly Meal Prep + Monthly Organization. Regular: ~$4,500/mo. Bundle: $4,000/mo. Save: 20%' },
  { id: '6', sort_order: 6, active: true, created_at: '', badge: 'Commercial Bundle', headline: 'Small Office Complete', detail: '3x/week Janitorial + Weekly Window Cleaning + Monthly Floor Maintenance. Regular: ~$4,500/mo. Bundle: $4,000/mo. Save: 15%' },
  { id: '7', sort_order: 7, active: true, created_at: '', badge: 'Commercial Bundle', headline: 'Medium Office Premium', detail: '5x/week Janitorial + 2x/week Windows + 2x/month Deep Clean + Monthly Floor Maintenance. Regular: ~$5,000/mo. Bundle: $4,500/mo. Save: 10%' },
  { id: '8', sort_order: 8, active: true, created_at: '', badge: 'Commercial Bundle', headline: 'Enterprise Comprehensive', detail: 'Daily Janitorial + Weekly Specialized Services + Monthly Floor Care + Quarterly Deep Clean. Custom quote (typically 20% savings)' },
  { id: '9', sort_order: 9, active: true, created_at: '', badge: 'Military Discount', headline: '15% OFF All Services', detail: 'Military discount across board all services' },
]

export default async function DealsPage() {
  const dbDeals = await dbSelect<Deal>('deals', { active: 'eq.true', order: 'sort_order' })
  const deals = dbDeals.length > 0 ? dbDeals : STATIC_DEALS

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Save More</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Package Deals & Bundles
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Save money with bundled services. Special pricing on recurring packages for residential and commercial clients.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-10">
        <AnimatedSection>
          <div className="bg-white border border-gray-200 p-8 md:p-10">
            <h2 className="font-serif text-2xl md:text-3xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Bundle Savings Overview
            </h2>
            <div className="grid sm:grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-chm-red mb-4">Residential Bundles</p>
                <ul className="space-y-2 text-gray-600">
                  <li><span className="font-semibold text-chm-black">Essentials:</span> Save 15% — $750/mo</li>
                  <li><span className="font-semibold text-chm-black">Comfort:</span> Save 18% — $900/mo</li>
                  <li><span className="font-semibold text-chm-black">Luxury:</span> Save 20% — $5,000/mo</li>
                  <li><span className="font-semibold text-chm-black">Family Care:</span> Save 20% — $3,000/mo</li>
                  <li><span className="font-semibold text-chm-black">Senior Care:</span> Save 20% — $4,000/mo</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-chm-red mb-4">Commercial Bundles</p>
                <ul className="space-y-2 text-gray-600">
                  <li><span className="font-semibold text-chm-black">Small Office:</span> Save 15% — $4,000/mo</li>
                  <li><span className="font-semibold text-chm-black">Medium Office:</span> Save 10% — $4,500/mo</li>
                  <li><span className="font-semibold text-chm-black">Enterprise:</span> Save 20% — Custom quote</li>
                  <li className="pt-2 border-t border-gray-100 mt-4"><span className="font-semibold text-chm-black">Military:</span> 15% OFF all services</li>
                </ul>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
          {deals.map((d, i) => (
            <AnimatedSection key={d.id} delay={i * 80}>
              <div className="bg-white p-8 hover:bg-cream transition-colors h-full">
                <span className="text-xs font-semibold uppercase tracking-widest text-chm-red border border-chm-red/30 px-3 py-1 inline-block mb-5">
                  {d.badge}
                </span>
                <h2 className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                  {d.headline}
                </h2>
                {d.detail && <p className="text-gray-500 text-sm leading-relaxed">{d.detail}</p>}
              </div>
            </AnimatedSection>
          ))}
        </div>

        <ReferralProgram />

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
            <Link
              href="/membership"
              className="shrink-0 bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Join for Free
            </Link>
          </div>
        </AnimatedSection>

        <p className="text-xs text-gray-400 leading-relaxed">
          * Bundle pricing valid for recurring monthly contracts. Cannot be combined unless specified. Contact us at 202-579-2944 to redeem.
        </p>
      </div>
    </div>
  )
}
