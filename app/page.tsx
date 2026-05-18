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

const SERVICE_IMAGES: Record<string, string> = {
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=75',
  culinary: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=75',
  laundry:  'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=75',
  care:     'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=900&q=75',
}

function LeafSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 290" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/*
        Key: first control point sits directly below tip (same x=80)
        so both halves start STRAIGHT DOWN before curving outward.
        This produces a sharp pointed tip instead of a balloon top.
      */}
      <path
        fill="currentColor"
        d="M80,5
           C 80,32 148,62 150,108
           C 150,158 118,230 80,274
           C 42,230 10,158 10,108
           C 12,62 80,32 80,5 Z"
      />
      {/* Stem */}
      <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M80,274 L80,286"/>
      {/* Midrib */}
      <path fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.38" d="M80,274 L80,5"/>
      {/* Secondary veins — radiate upward from midrib toward margin */}
      <path fill="none" stroke="white" strokeWidth="0.7" strokeOpacity="0.30"
        d="M80,55  L130,40  M80,55  L30,40
           M80,88  L142,72  M80,88  L18,72
           M80,118 L150,103 M80,118 L10,103
           M80,148 L146,135 M80,148 L14,135
           M80,178 L136,167 M80,178 L24,167
           M80,208 L120,200 M80,208 L40,200
           M80,238 L105,233 M80,238 L55,233"
      />
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
      <section className="relative bg-cream overflow-hidden flex items-center py-16 md:py-24">
        <div className="absolute inset-0 pointer-events-none select-none">
          <LeafSVG className="absolute -right-8 top-[-4%] w-[340px] h-[340px] text-chm-red opacity-[0.48] rotate-12" />
          <LeafSVG className="absolute -left-16 bottom-[-10%] w-[420px] h-[420px] text-chm-red opacity-[0.10] -rotate-20 scale-x-[-1]" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 w-full">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            Maryland &nbsp;·&nbsp; Virginia &nbsp;·&nbsp; Washington D.C.
          </p>
          <h1
            className="font-serif text-5xl md:text-7xl text-chm-black leading-[1.05] max-w-2xl mb-5"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Home Services,<br />
            <span className="text-chm-red italic">Simplified.</span>
          </h1>
          <div className="w-10 h-px bg-chm-red mb-5" />
          <p className="text-gray-500 text-base max-w-lg leading-relaxed mb-8 font-light">
            Professional cleaning, laundry, culinary support, and care — tailored to your schedule.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/book" className="bg-chm-red text-white px-8 py-3 font-semibold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors">
              Book Now
            </Link>
            <a href="https://wa.me/12025792944" className="border border-chm-black/20 text-chm-black px-8 py-3 font-semibold uppercase tracking-widest text-xs hover:border-chm-red hover:text-chm-red transition-colors">
              WhatsApp
            </a>
            <a href="tel:+12025792944" className="border border-chm-black/20 text-chm-black px-8 py-3 font-semibold uppercase tracking-widest text-xs hover:border-chm-red hover:text-chm-red transition-colors">
              Call 202-579-2944
            </a>
          </div>
          <div className="flex items-center gap-1.5 mt-5">
            <span className="text-amber-400 text-sm leading-none">★★★★★</span>
            <span className="text-chm-black/60 text-xs font-medium">5.0 · Google Reviews</span>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-center gap-3">
          <span className="text-chm-red font-bold text-base">✓</span>
          <span className="text-chm-black text-xs font-semibold uppercase tracking-[0.25em]">We Are Fully Insured</span>
        </div>
      </div>

      {/* ── Quick-nav strip ───────────────────────────────── */}
      <div className="bg-chm-black border-b border-white/10 sticky top-24 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center overflow-x-auto gap-0 scrollbar-none">
          {[
            { href: '#services', label: 'Services' },
            { href: '#deals',    label: 'Deals' },
            { href: '/services', label: 'Full Pricing' },
            { href: '#contact',  label: 'Contact' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="shrink-0 text-gray-400 hover:text-white text-xs uppercase tracking-widest font-semibold px-5 py-3.5 border-r border-white/10 hover:bg-white/5 transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href="https://wa.me/12025792944"
            className="shrink-0 ml-auto text-chm-red text-xs uppercase tracking-widest font-semibold px-5 py-3.5 hover:text-white transition-colors"
          >
            Book Now ›
          </a>
        </div>
      </div>

      {/* ── Services ─────────────────────────────────────── */}
      {services && services.length > 0 && (
        <section id="services" className="bg-white py-14 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none">
            <LeafSVG className="absolute -left-10 top-[5%] w-[220px] h-[220px] text-chm-red opacity-[0.14] -rotate-12 scale-x-[-1]" />
          </div>
          <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
            <AnimatedSection>
              <div className="mb-10">
                <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">What We Offer</p>
                <h2 className="font-serif text-4xl md:text-5xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                  Our Services
                </h2>
                <div className="w-10 h-px bg-chm-red mt-4" />
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
              {(services as Service[]).map((s, i) => (
                <AnimatedSection key={s.id} delay={i * 60}>
                  <Link href={`/services#${s.slug}`} className="bg-white flex flex-col hover:bg-cream transition-colors group block h-full">
                    <div className="relative overflow-hidden h-44">
                      <img
                        src={SERVICE_IMAGES[s.slug] ?? ''}
                        alt={s.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-chm-black/10 group-hover:bg-chm-black/5 transition-colors" />
                    </div>
                    <div className="p-6 md:p-8 flex flex-col gap-2 flex-1">
                      <div className="w-6 h-px bg-chm-red" />
                      <h3 className="font-serif text-xl text-chm-black group-hover:text-chm-red transition-colors" style={{ fontFamily: 'var(--font-serif)' }}>
                        {s.title}
                      </h3>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">{s.subtitle}</p>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1 font-light">{s.description}</p>
                      <p className="text-chm-red font-semibold text-xs tracking-wide mt-1">{s.price_from}</p>
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="mt-6">
              <Link href="/services" className="inline-block text-chm-red text-xs font-semibold uppercase tracking-[0.25em] hover:underline underline-offset-4">
                View Full Pricing →
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ── Deals ────────────────────────────────────────── */}
      {deals && deals.length > 0 && (
        <section id="deals" className="bg-cream py-14 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none">
            <LeafSVG className="absolute -right-6 top-[-5%] w-[260px] h-[260px] text-chm-red opacity-[0.20] rotate-6" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
            <AnimatedSection>
              <div className="mb-10">
                <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Limited Time</p>
                <h2 className="font-serif text-4xl md:text-5xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                  This Week&apos;s Deals
                </h2>
                <div className="w-10 h-px bg-chm-red mt-4" />
              </div>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
              {(deals as Deal[]).map((d, i) => (
                <AnimatedSection key={d.id} delay={i * 60}>
                  <div className="bg-white p-6 hover:bg-blush transition-colors h-full">
                    <p className="text-chm-red font-semibold text-xs uppercase tracking-widest mb-3">{d.badge}</p>
                    <p className="font-serif text-chm-black text-base mb-2 leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
                      {d.headline}
                    </p>
                    <p className="text-gray-500 text-xs leading-relaxed font-light">{d.detail}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="mt-6">
              <Link href="/deals" className="inline-block text-chm-red text-xs font-semibold uppercase tracking-[0.25em] hover:underline underline-offset-4">
                View All Deals →
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ── Contact strip ────────────────────────────────── */}
      <section id="contact" className="bg-white py-14 md:py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <AnimatedSection>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div>
                <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Ready to Book?</p>
                <h2 className="font-serif text-4xl md:text-5xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                  Get in Touch
                </h2>
                <div className="w-10 h-px bg-chm-red mt-4 mb-4" />
                <p className="text-gray-400 text-xs tracking-widest uppercase">Mon – Sat &nbsp;·&nbsp; 9 AM – 9 PM</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a href="tel:+12025792944" className="bg-chm-red text-white px-7 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">Call</a>
                <a href="sms:+12025792944" className="border border-chm-black/20 text-chm-black px-7 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red hover:text-chm-red transition-colors">Text</a>
                <a href="https://wa.me/12025792944" className="border border-chm-black/20 text-chm-black px-7 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red hover:text-chm-red transition-colors">WhatsApp</a>
                <a href="mailto:conveniencehubofmaryland@gmail.com" className="border border-chm-black/20 text-chm-black px-7 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red hover:text-chm-red transition-colors">Email</a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
