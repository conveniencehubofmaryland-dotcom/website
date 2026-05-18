import type { Metadata } from 'next'
import Link from 'next/link'
import { dbSelect } from '@/lib/db'
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
  laundry:    '/service-laundry.jpg',
  cleaning:   '/service-cleaning.jpg',
  culinary:   '/service-culinary.jpg',
  care:       '/service-care.jpg',
  commercial: '/commercial-hero.jpg',
}

function LeafSVG({ className = '' }: { className?: string }) {
  // High-detail cordate (heart-shaped) tropical leaf matching reference photo.
  // viewBox 400×480 for crisp rendering at large sizes.
  // Primary veins (8 pairs) + secondary network (~44 veins) = very high definition.
  return (
    <svg viewBox="0 0 400 480" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Stem */}
      <path fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" d="M200,50 L200,8"/>
      {/* Cordate leaf body: two lobes at top, deep notch at center, pointed tip at bottom */}
      <path
        fill="currentColor"
        d="M200,50
           C 226,18 308,15 342,78
           C 372,138 360,242 325,335
           C 296,412 252,455 200,474
           C 148,455 104,412 75,335
           C 40,242 28,138 58,78
           C 92,15 174,18 200,50 Z"
      />
      {/* ── Midrib ── */}
      <path fill="none" stroke="white" strokeWidth="3.5" strokeOpacity="0.42" d="M200,50 L200,474"/>
      {/* ── Primary veins — 8 pairs, radiating from midrib, curving toward margin ── */}
      <g fill="none" stroke="white" strokeLinecap="round">
        {/* Pair 1 — into lobes */}
        <path strokeWidth="2.4" strokeOpacity="0.38" d="M200,78 C 240,70 295,62 340,80"/>
        <path strokeWidth="2.4" strokeOpacity="0.38" d="M200,78 C 160,70 105,62 60,80"/>
        {/* Pair 2 */}
        <path strokeWidth="2.2" strokeOpacity="0.36" d="M200,122 C 248,118 308,114 355,122"/>
        <path strokeWidth="2.2" strokeOpacity="0.36" d="M200,122 C 152,118 92,114 45,122"/>
        {/* Pair 3 */}
        <path strokeWidth="2.0" strokeOpacity="0.34" d="M200,170 C 250,167 314,164 362,172"/>
        <path strokeWidth="2.0" strokeOpacity="0.34" d="M200,170 C 150,167 86,164 38,172"/>
        {/* Pair 4 */}
        <path strokeWidth="1.8" strokeOpacity="0.32" d="M200,220 C 250,218 312,216 358,224"/>
        <path strokeWidth="1.8" strokeOpacity="0.32" d="M200,220 C 150,218 88,216 42,224"/>
        {/* Pair 5 */}
        <path strokeWidth="1.6" strokeOpacity="0.30" d="M200,268 C 248,267 306,265 348,273"/>
        <path strokeWidth="1.6" strokeOpacity="0.30" d="M200,268 C 152,267 94,265 52,273"/>
        {/* Pair 6 */}
        <path strokeWidth="1.4" strokeOpacity="0.28" d="M200,315 C 244,314 294,313 328,319"/>
        <path strokeWidth="1.4" strokeOpacity="0.28" d="M200,315 C 156,314 106,313 72,319"/>
        {/* Pair 7 */}
        <path strokeWidth="1.2" strokeOpacity="0.26" d="M200,360 C 236,360 276,360 306,365"/>
        <path strokeWidth="1.2" strokeOpacity="0.26" d="M200,360 C 164,360 124,360 94,365"/>
        {/* Pair 8 — near tip */}
        <path strokeWidth="0.9" strokeOpacity="0.22" d="M200,408 C 222,408 248,410 268,414"/>
        <path strokeWidth="0.9" strokeOpacity="0.22" d="M200,408 C 178,408 152,410 132,414"/>
      </g>
      {/* ── Secondary veins — fine network between primary pairs ── */}
      <g fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.18" strokeLinecap="round">
        {/* Between pairs 1-2, right */}
        <path d="M338,82 C 344,92 350,108 352,120"/>
        <path d="M312,66 C 320,78 328,95 330,110"/>
        <path d="M282,62 C 288,74 294,90 296,106"/>
        {/* Between pairs 1-2, left */}
        <path d="M62,82 C 56,92 50,108 48,120"/>
        <path d="M88,66 C 80,78 72,95 70,110"/>
        <path d="M118,62 C 112,74 106,90 104,106"/>
        {/* Between pairs 2-3, right */}
        <path d="M353,124 C 357,136 360,152 362,164"/>
        <path d="M326,116 C 330,128 334,144 336,158"/>
        <path d="M298,113 C 302,126 306,142 308,156"/>
        {/* Between pairs 2-3, left */}
        <path d="M47,124 C 43,136 40,152 38,164"/>
        <path d="M74,116 C 70,128 66,144 64,158"/>
        <path d="M102,113 C 98,126 94,142 92,156"/>
        {/* Between pairs 3-4, right */}
        <path d="M360,174 C 362,186 362,202 360,216"/>
        <path d="M336,166 C 338,178 340,194 340,208"/>
        <path d="M308,163 C 310,175 312,191 312,205"/>
        {/* Between pairs 3-4, left */}
        <path d="M40,174 C 38,186 38,202 40,216"/>
        <path d="M64,166 C 62,178 60,194 60,208"/>
        <path d="M92,163 C 90,175 88,191 88,205"/>
        {/* Between pairs 4-5, right */}
        <path d="M356,226 C 355,238 352,254 349,266"/>
        <path d="M332,218 C 332,230 332,246 331,260"/>
        <path d="M306,216 C 306,228 307,244 307,258"/>
        {/* Between pairs 4-5, left */}
        <path d="M44,226 C 45,238 48,254 51,266"/>
        <path d="M68,218 C 68,230 68,246 69,260"/>
        <path d="M94,216 C 94,228 93,244 93,258"/>
        {/* Between pairs 5-6, right */}
        <path d="M346,275 C 343,287 338,303 334,316"/>
        <path d="M320,268 C 318,280 316,296 314,310"/>
        <path d="M294,266 C 293,278 293,294 293,308"/>
        {/* Between pairs 5-6, left */}
        <path d="M54,275 C 57,287 62,303 66,316"/>
        <path d="M80,268 C 82,280 84,296 86,310"/>
        <path d="M106,266 C 107,278 107,294 107,308"/>
        {/* Between pairs 6-7, right */}
        <path d="M326,321 C 322,333 315,348 309,360"/>
        <path d="M302,316 C 299,328 297,344 295,357"/>
        {/* Between pairs 6-7, left */}
        <path d="M74,321 C 78,333 85,348 91,360"/>
        <path d="M98,316 C 101,328 103,344 105,357"/>
        {/* Between pairs 7-8, right */}
        <path d="M304,367 C 299,378 291,392 284,404"/>
        <path d="M280,363 C 276,374 272,388 268,400"/>
        {/* Between pairs 7-8, left */}
        <path d="M96,367 C 101,378 109,392 116,404"/>
        <path d="M120,363 C 124,374 128,388 132,400"/>
      </g>
    </svg>
  )
}

export default async function HomePage() {
  const [services, deals] = await Promise.all([
    dbSelect<Service>('services', { active: 'eq.true', order: 'sort_order', select: 'id,slug,title,subtitle,description,price_from' }),
    dbSelect<Deal>('deals', { active: 'eq.true', order: 'sort_order', select: 'id,badge,headline,detail' }),
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
          {/* Real leaf photo — transparent background PNG */}
          <img
            src="/leaf-hero-removebg-preview.png"
            alt=""
            aria-hidden="true"
            className="absolute -right-8 top-0 w-[380px] md:w-[480px] h-auto opacity-95 rotate-3 pointer-events-none"
          />
          {/* Subtle watermark — bottom left */}
          <LeafSVG className="absolute -left-16 bottom-[-10%] w-[400px] h-auto text-chm-red opacity-[0.08] -rotate-20 scale-x-[-1]" />
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
      <div className="bg-chm-black border-b border-white/10 sticky top-28 z-40">
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
              {(services ?? []).map((s, i) => (
                <AnimatedSection
                  key={s.id}
                  delay={i * 60}
                  className={services.length % 2 === 1 && i === services.length - 1 ? 'md:col-span-2' : ''}
                >
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
              {(deals ?? []).map((d, i) => (
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
