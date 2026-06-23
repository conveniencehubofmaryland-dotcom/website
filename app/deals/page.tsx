import type { Metadata } from 'next'
import Link from 'next/link'
import AnimatedSection from '@/components/AnimatedSection'
import ReferralProgram from '@/components/ReferralProgram'

export const metadata: Metadata = {
  title: 'Package Deals & Bundles | Convenience Hub of Maryland',
  description: 'Save 10-20% with residential and commercial service bundles. Military discounts, loyalty program, and first-time specials available.',
}

export default function DealsPage() {
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

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">
        {/* Bundle Overview */}
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
              {[
                {
                  name: 'The Essentials Bundle',
                  includes: 'Weekly Standard Cleaning + Bi-Weekly Laundry',
                  regular: '~$850/month',
                  bundle: '$750/month',
                  save: '15%'
                },
                {
                  name: 'The Comfort Bundle',
                  includes: 'Bi-Weekly Cleaning + Weekly Meal Prep + Monthly Organization',
                  regular: '~$1,100/month',
                  bundle: '$900/month',
                  save: '18%'
                },
                {
                  name: 'The Luxury Bundle',
                  includes: 'Weekly Cleaning + Bi-Weekly Laundry + 3x/Week Meal Prep + Bi-Weekly Nanny + Monthly Organization',
                  regular: '~$6,000/month',
                  bundle: '$5,000/month',
                  save: '20%'
                },
                {
                  name: 'Family Care Bundle',
                  subtitle: 'With Children',
                  includes: 'Weekly Cleaning + Bi-Weekly Childcare (16 hrs) + Weekly Meal Prep + Monthly Organization',
                  regular: '~$3,500/month',
                  bundle: '$3,000/month',
                  save: '20%'
                },
                {
                  name: 'Senior Care Bundle',
                  subtitle: 'Elderly Parent',
                  includes: 'Weekly Cleaning + 20 hrs/week Companion Care + Weekly Meal Prep + Monthly Organization',
                  regular: '~$4,500/month',
                  bundle: '$4,000/month',
                  save: '20%'
                }
              ].map((bundle, i) => (
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
              {[
                {
                  name: 'Small Office Complete',
                  includes: '3x/week Janitorial + Weekly Window Cleaning + Monthly Floor Maintenance',
                  regular: '~$4,500/month',
                  bundle: '$4,000/month',
                  save: '15%'
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
              ].map((bundle, i) => (
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

            <div className="bg-chm-black text-white p-6 text-center">
              <p className="text-sm">
                <span className="text-chm-red font-semibold uppercase tracking-widest">Military Discount:</span> 15% discount across board all services
              </p>
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
                <p className="font-mono text-chm-red text-lg mb-2">WELCOME2026</p>
                <p className="text-gray-600">15% off first service (any service)</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <ReferralProgram />

        {/* Premium Member Status */}
        <AnimatedSection>
          <div className="bg-white border border-gray-200 p-8 md:p-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Loyalty Program</p>
            <h2 className="font-serif text-3xl text-chm-black mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Premium Member Status
            </h2>
            <p className="text-gray-500 text-sm mb-6">Requirement: 12-month subscription or 12+ services/year</p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span>15% discount on all services</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span>Priority scheduling</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span>Free upgrade services (quarterly)</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span>Dedicated customer service line</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span>Quarterly loyalty bonus ($25 credit)</span></div>
            </div>
          </div>
        </AnimatedSection>

        {/* FAQ & Policies */}
        <AnimatedSection>
          <div className="space-y-10">
            <div>
              <h2 className="font-serif text-3xl text-chm-black mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
                Payment & Billing
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

            <div className="border-t border-gray-100 pt-10">
              <h3 className="font-serif text-2xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Guarantees & Promises
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Satisfaction Guarantee:</span> Not satisfied? Free re-do within 24 hours</span></div>
                <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Quality Guarantee:</span> Staff background-checked, insured, professionally trained</span></div>
                <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Price Lock Guarantee:</span> Recurring contracts lock price for 12 months</span></div>
                <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Safety Guarantee:</span> Zero tolerance for unsafe practices</span></div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Service Areas */}
        <AnimatedSection>
          <div className="bg-cream p-8 md:p-10">
            <h2 className="font-serif text-3xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Service Areas
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-chm-black mb-2">Maryland</p>
                <p>Bethesda, Chevy Chase, Potomac, Gaithersburg, Rockville, Hyattsville, Camp Springs, Laurel, Bowie, Columbia, and surrounding areas</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-2">Virginia</p>
                <p>McLean, Arlington, Falls Church, Fairfax, Ashburn and surrounding areas</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-2">Washington DC</p>
                <p>All neighborhoods</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-6">Service Radius: We cover all areas</p>
          </div>
        </AnimatedSection>

        {/* Why Choose Us */}
        <AnimatedSection>
          <div className="bg-white border border-gray-200 p-8 md:p-10">
            <h2 className="font-serif text-3xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
              Why Choose Convenience Hub?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Professional & Vetted Staff</span> — All background-checked, CPR-certified, trained</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Eco-Friendly & Safe</span> — Non-toxic products, safe practices always</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Transparent Pricing</span> — No hidden fees, what you see is what you pay</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Flexible & Responsive</span> — We work around YOUR schedule</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Guaranteed Quality</span> — Satisfaction guaranteed or we make it right</span></div>
              <div className="flex gap-3"><span className="text-chm-red">✓</span><span><span className="font-semibold text-chm-black">Local DMV Experts</span> — Serving Maryland, DC, and Virginia since 2024</span></div>
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection>
          <div className="bg-chm-black text-white p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.2em] mb-3">Book Now</p>
              <p className="font-serif text-3xl text-white mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Schedule Your Service
              </p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Phone: 202-579-2944 | Email: conveniencehubofmaryland@gmail.com<br/>
                Mon–Sat 8AM–6PM EST | Sunday by appointment
              </p>
            </div>
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
