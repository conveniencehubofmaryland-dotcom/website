import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import type { Service, Deal } from '@/lib/types'
import AnimatedSection from '@/components/AnimatedSection'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Convenience Hub of Maryland | Home Services DMV',
  description:
    'Reliable home services in Maryland, Virginia & D.C. — cleaning, laundry pickup & delivery, culinary, and care. Call or text 202-579-2944.',
  openGraph: {
    title: 'Convenience Hub of Maryland | Home Services DMV',
    description: 'Reliable home services in the DMV. Call or text 202-579-2944.',
  },
}

function RoseSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="-45 -50 90 120" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor">
      <circle r="6" strokeWidth="1" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="0" cy="-15" rx="5" ry="11" strokeWidth="0.8" transform={`rotate(${deg})`} />
      ))}
      {[30, 90, 150, 210, 270, 330].map((deg) => (
        <ellipse key={deg} cx="0" cy="-24" rx="7" ry="14" strokeWidth="0.6" transform={`rotate(${deg})`} />
      ))}
      <path d="M0,7 C0,28 -4,38 0,60" strokeWidth="1" />
      <ellipse cx="-13" cy="32" rx="8" ry="17" strokeWidth="0.7" transform="rotate(-28 -13 32)" />
      <ellipse cx="12" cy="46" rx="7" ry="14" strokeWidth="0.7" transform="rotate(22 12 46)" />
    </svg>
  )
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: services }, { data: deals }] = await Promise.all([
    supabase.from('services').select('id, slug, title, subtitle, description, price_from').eq('active', true).order('sort_order'),
    supabase.from('deals').select('id, badge, headline, detail').eq('active', true).order('sort_order'),
  ])

  return (
    <>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Convenience Hub of Maryland',
            telephone: '+12025792944',
            email: 'conveniencehubofmaryland@gmail.com',
            url: 'https://www.conveniencehubofmaryland.com',
            description: 'One-stop home services for the DMV.',
            areaServed: ['Maryland', 'Virginia', 'Washington D.C.'],
            openingHours: 'Mo-Sa 09:00-21:00',
          }),
        }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-64px)] bg-cream overflow-hidden flex items-center">
        {/* Botanical watermark */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <RoseSVG className="absolute -right-10 top-[2%] w-[460px] h-[460px] text-chm-red opacity-[0.04] rotate-12" />
          <RoseSVG className="absolute -left-20 bottom-[-6%] w-[320px] h-[320px] text-chm-red opacity-[0.03] -rotate-15" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 py-24 w-full">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-8">
            Maryland &nbsp;·&nbsp; Virginia &nbsp;·&nbsp; Washington D.C.
          </p>
          <h1
            className="font-serif text-6xl md:text-8xl text-chm-black leading-[1.05] max-w-3xl mb-8"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Home Services,<br />
            <span className="text-chm-red italic">Simplified.</span>
          </h1>
          <div className="w-12 h-px bg-chm-red mb-8" />
          <p className="text-gray-500 text-lg max-w-lg leading-relaxed mb-12 font-light">
            Professional cleaning, laundry, culinary support, and care — tailored to your schedule.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://wa.me/12025792944"
              className="bg-chm-red text-white px-10 py-4 font-semibold uppercase tracking-widest text-sm hover:bg-red-700 transition-colors"
            >
              Book via WhatsApp
            </a>
            <a
              href="tel:+12025792944"
              className="border border-chm-black/20 text-chm-black px-10 py-4 font-semibold uppercase tracking-widest text-sm hover:border-chm-red hover:text-chm-red transition-colors"
            >
              Call 202-579-2944
            </a>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────── */}
      {services && services.length > 0 && (
        <section className="bg-white py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <AnimatedSection>
              <div className="mb-16">
                <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-4">What We Offer</p>
                <h2
                  className="font-serif text-5xl md:text-6xl text-chm-black"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Our Services
                </h2>
                <div className="w-12 h-px bg-chm-red mt-6" />
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
              {(services as Service[]).map((s, i) => (
                <AnimatedSection key={s.id} delay={i * 80}>
                  <Link
                    href={`/services#${s.slug}`}
                    className="bg-white p-10 md:p-12 flex flex-col gap-4 hover:bg-cream transition-colors group block h-full"
                  >
                    <div className="w-8 h-px bg-chm-red" />
                    <h3
                      className="font-serif text-2xl text-chm-black group-hover:text-chm-red transition-colors"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{s.subtitle}</p>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 font-light">{s.description}</p>
                    <p className="text-chm-red font-semibold text-sm tracking-wide">{s.price_from}</p>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="mt-10">
              <Link
                href="/services"
                className="inline-block text-chm-red text-xs font-semibold uppercase tracking-[0.25em] hover:underline underline-offset-4"
              >
                View Full Pricing →
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ── Deals ────────────────────────────────────────── */}
      {deals && deals.length > 0 && (
        <section className="bg-cream py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <RoseSVG className="absolute -right-8 top-[-8%] w-[300px] h-[300px] text-chm-red opacity-[0.05] rotate-6" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
            <AnimatedSection>
              <div className="mb-16">
                <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-4">Limited Time</p>
                <h2
                  className="font-serif text-5xl md:text-6xl text-chm-black"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  This Week&apos;s Deals
                </h2>
                <div className="w-12 h-px bg-chm-red mt-6" />
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
              {(deals as Deal[]).map((d, i) => (
                <AnimatedSection key={d.id} delay={i * 80}>
                  <div className="bg-white p-8 hover:bg-blush transition-colors h-full">
                    <p className="text-chm-red font-semibold text-xs uppercase tracking-widest mb-4">{d.badge}</p>
                    <p
                      className="font-serif text-chm-black text-lg mb-3 leading-snug"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {d.headline}
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed font-light">{d.detail}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="mt-10">
              <Link
                href="/deals"
                className="inline-block text-chm-red text-xs font-semibold uppercase tracking-[0.25em] hover:underline underline-offset-4"
              >
                View All Deals →
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ── Contact strip ────────────────────────────────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <AnimatedSection>
            <div className="border-t border-gray-100 pt-16 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
              <div>
                <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-4">Ready to Book?</p>
                <h2
                  className="font-serif text-5xl md:text-6xl text-chm-black"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Get in Touch
                </h2>
                <div className="w-12 h-px bg-chm-red mt-6 mb-6" />
                <p className="text-gray-400 text-sm tracking-widest uppercase">Mon – Sat &nbsp;·&nbsp; 9 AM – 9 PM</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="tel:+12025792944" className="bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors">Call</a>
                <a href="sms:+12025792944" className="border border-chm-black/20 text-chm-black px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:border-chm-red hover:text-chm-red transition-colors">Text</a>
                <a href="https://wa.me/12025792944" className="border border-chm-black/20 text-chm-black px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:border-chm-red hover:text-chm-red transition-colors">WhatsApp</a>
                <a href="mailto:conveniencehubofmaryland@gmail.com" className="border border-chm-black/20 text-chm-black px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:border-chm-red hover:text-chm-red transition-colors">Email</a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
