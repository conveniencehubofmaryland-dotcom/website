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
    <svg viewBox="0 0 160 280" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor">
      {/* Main stem */}
      <path d="M80,270 C80,270 80,200 80,10" strokeWidth="1.2"/>
      {/* Main leaf body */}
      <path d="M80,10 C80,10 140,40 150,100 C160,160 130,220 80,270 C30,220 0,160 10,100 C20,40 80,10 80,10Z" strokeWidth="0.8"/>
      {/* Left veins */}
      <path d="M80,80 C60,70 30,65 15,75" strokeWidth="0.6"/>
      <path d="M80,120 C55,110 25,108 8,118" strokeWidth="0.6"/>
      <path d="M80,160 C58,152 30,152 14,162" strokeWidth="0.6"/>
      <path d="M80,200 C62,196 40,198 26,208" strokeWidth="0.6"/>
      {/* Right veins */}
      <path d="M80,80 C100,70 130,65 145,75" strokeWidth="0.6"/>
      <path d="M80,120 C105,110 135,108 152,118" strokeWidth="0.6"/>
      <path d="M80,160 C102,152 130,152 146,162" strokeWidth="0.6"/>
      <path d="M80,200 C98,196 120,198 134,208" strokeWidth="0.6"/>
    </svg>
  )
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
        {/* Leaf botanical backgrounds */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <LeafSVG className="absolute -right-8 top-[-4%] w-[380px] h-[380px] text-chm-red opacity-[0.10] rotate-12" />
          <LeafSVG className="absolute -left-12 bottom-[-8%] w-[320px] h-[320px] text-chm-red opacity-[0.08] -rotate-20 scale-x-[-1]" />
          <RoseSVG className="absolute right-[30%] bottom-[10%] w-[140px] h-[140px] text-chm-red opacity-[0.12] rotate-6" />
        </div>

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
            Professional cleaning, laundry, culinary support, and care — tailored to your schedule in the DMV area.
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
        <section className="bg-white py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none">
            <LeafSVG className="absolute -left-10 top-[10%] w-[260px] h-[260px] text-chm-red opacity-[0.06] -rotate-12 scale-x-[-1]" />
            <LeafSVG className="absolute -right-8 bottom-[5%] w-[220px] h-[220px] text-chm-red opacity-[0.05] rotate-15" />
          </div>
          <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
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
                    className="bg-white flex flex-col hover:bg-cream transition-colors group block h-full"
                  >
                    {/* Service image */}
                    <div className="relative overflow-hidden h-52">
                      <img
                        src={SERVICE_IMAGES[s.slug] ?? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=75'}
                        alt={s.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-chm-black/10 group-hover:bg-chm-black/5 transition-colors" />
                    </div>
                    {/* Card content */}
                    <div className="p-8 md:p-10 flex flex-col gap-3 flex-1">
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
                    </div>
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
          <div className="absolute inset-0 pointer-events-none select-none">
            <LeafSVG className="absolute -right-6 top-[-5%] w-[300px] h-[300px] text-chm-red opacity-[0.09] rotate-6" />
            <LeafSVG className="absolute left-[5%] bottom-[-4%] w-[200px] h-[200px] text-chm-red opacity-[0.06] -rotate-10 scale-x-[-1]" />
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
      <section className="bg-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <LeafSVG className="absolute -right-10 top-[5%] w-[240px] h-[240px] text-chm-red opacity-[0.07] rotate-20" />
        </div>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
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
