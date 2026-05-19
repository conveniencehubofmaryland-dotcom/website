import type { Metadata } from 'next'
import Link from 'next/link'


export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Convenience Hub of Maryland — a trusted home services company serving Maryland, Virginia, and Washington D.C. with cleaning, laundry, culinary, and care services.',
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Our Story</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            About Us
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Reliable, professional home services for the DMV — so you can focus on what matters most.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16 space-y-16">

        {/* Mission */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-chm-red" />
            <span className="text-chm-red text-lg">✿</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            Who We Are
          </h2>
          <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p>
              Convenience Hub of Maryland is a full-service home and estate management company proudly serving the
              Maryland, Virginia, and Washington D.C. metropolitan area. We were built on a simple belief: your time
              is valuable, and your home deserves professional care.
            </p>
            <p>
              From professional deep cleaning and premium laundry pickup &amp; delivery, to culinary support,
              household management, nanny services, and commercial operations — we offer a complete suite of
              services designed to simplify your daily routine.
            </p>
            <p>
              Every member of our team is rigorously vetted, background-checked, and trained to deliver consistent,
              high-quality results. We are fully insured, giving you complete peace of mind on every visit.
            </p>
          </div>
        </section>

        {/* Values */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-chm-red" />
            <span className="text-chm-red text-lg">✿</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-chm-black mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100">
            {[
              { title: 'Reliability', body: 'We show up on time, every time. Consistency is the foundation of trust.' },
              { title: 'Professionalism', body: 'Every team member is vetted, trained, and held to elite household standards.' },
              { title: 'Transparency', body: 'Flat rates, clear pricing, and no surprise fees — ever.' },
            ].map(v => (
              <div key={v.title} className="bg-white p-8">
                <div className="w-6 h-px bg-chm-red mb-4" />
                <h3 className="font-serif text-xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Service area */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-px bg-chm-red" />
            <span className="text-chm-red text-lg">✿</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-chm-black mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            Service Area
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            We proudly serve residential and commercial clients across the greater DMV region, including all of
            Maryland, Northern Virginia (NOVA), Washington D.C., Howard County, and Loudoun County.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Maryland', 'Northern Virginia', 'Washington D.C.', 'Montgomery County', 'Prince George\'s County', 'Howard County', 'Fairfax County', 'Loudoun County', 'Arlington'].map(area => (
              <span key={area} className="border border-gray-200 text-gray-500 text-xs uppercase tracking-widest px-4 py-2">
                {area}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-chm-red/20 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-serif text-2xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
              Ready to get started?
            </p>
            <p className="text-gray-500 text-sm mt-1">Book a service or reach out — we respond within 1 hour.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/book" className="bg-chm-red text-white px-6 py-2.5 font-semibold text-sm uppercase tracking-wide hover:bg-red-700 transition-colors">
              Book Now
            </Link>
            <Link href="/contact" className="border border-chm-black/30 text-chm-black px-6 py-2.5 font-semibold text-sm uppercase tracking-wide hover:border-chm-red hover:text-chm-red transition-colors">
              Contact
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
