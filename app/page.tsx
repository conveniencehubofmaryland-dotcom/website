import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import type { Service, Deal } from '@/lib/types'

export const runtime = 'edge'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Convenience Hub of Maryland | Home Services DMV',
  description:
    'Reliable home services in Maryland, Virginia & D.C. — cleaning, laundry pickup & delivery, culinary, and care. Call or text 202-579-2944.',
  openGraph: {
    title: 'Convenience Hub of Maryland | Home Services DMV',
    description: 'Reliable home services in the DMV. Call or text 202-579-2944.',
  },
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: services }, { data: deals }] = await Promise.all([
    supabase
      .from('services')
      .select('id, slug, title, subtitle, description, price_from')
      .eq('active', true)
      .order('sort_order'),
    supabase
      .from('deals')
      .select('id, badge, headline, detail')
      .eq('active', true)
      .order('sort_order'),
  ])

  return (
    <>
      {/* Schema.org LocalBusiness */}
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
            description: 'One-stop home services for the DMV — cleaning, laundry, culinary, and care.',
            areaServed: ['Maryland', 'Virginia', 'Washington D.C.'],
            openingHours: 'Mo-Sa 09:00-21:00',
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-white border-b-4 border-chm-red">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <p className="text-chm-red text-xs font-bold uppercase tracking-widest mb-4">
            Maryland • Virginia • Washington D.C.
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-chm-black leading-tight max-w-3xl">
            One-Stop Home Services<br />
            <span className="text-chm-red">for the DMV.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-xl">
            Reliable • Professional • Convenient — cleaning, laundry, culinary support, and care services tailored to your schedule.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="https://wa.me/12025792944"
              className="bg-chm-red text-white px-8 py-3 font-bold uppercase tracking-wide text-sm hover:bg-red-700 transition-colors"
            >
              Book via WhatsApp
            </a>
            <a
              href="tel:+12025792944"
              className="border-2 border-chm-black text-chm-black px-8 py-3 font-bold uppercase tracking-wide text-sm hover:border-chm-red hover:text-chm-red transition-colors"
            >
              Call 202-579-2944
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      {services && services.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-chm-red text-xs font-bold uppercase tracking-widest mb-2">What We Offer</p>
                <h2 className="text-3xl md:text-4xl font-black text-chm-black">Our Services</h2>
              </div>
              <Link
                href="/services"
                className="text-chm-red text-sm font-semibold uppercase tracking-wide hover:underline hidden sm:block"
              >
                View Full Pricing →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
              {(services as Service[]).map((s) => (
                <Link
                  key={s.id}
                  href={`/services#${s.slug}`}
                  className="bg-white p-8 hover:bg-red-50 transition-colors group"
                >
                  <div className="w-8 h-1 bg-chm-red mb-5" />
                  <h3 className="text-xl font-bold text-chm-black group-hover:text-chm-red transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mt-1 mb-3">{s.subtitle}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.description}</p>
                  <p className="mt-4 text-chm-red font-bold text-sm">{s.price_from}</p>
                </Link>
              ))}
            </div>

            <Link
              href="/services"
              className="mt-4 sm:hidden inline-block text-chm-red text-sm font-semibold uppercase tracking-wide hover:underline"
            >
              View Full Pricing →
            </Link>
          </div>
        </section>
      )}

      {/* Deals strip */}
      {deals && deals.length > 0 && (
        <section className="bg-chm-red text-white py-14">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-2">Limited Time</p>
              <h2 className="text-3xl font-black">This Week&apos;s Deals</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(deals as Deal[]).map((d) => (
                <div key={d.id} className="border border-white/30 p-5">
                  <p className="font-black text-lg uppercase tracking-wide mb-2">{d.badge}</p>
                  <p className="font-bold mb-1">{d.headline}</p>
                  <p className="text-red-100 text-sm leading-relaxed">{d.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/deals"
                className="inline-block border-2 border-white text-white px-6 py-2 text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-chm-red transition-colors"
              >
                View All Deals
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Contact strip */}
      <section className="bg-chm-black text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-chm-red text-xs font-bold uppercase tracking-widest mb-3">Ready to Book?</p>
          <h2 className="text-3xl font-black mb-8">Get in Touch</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+12025792944" className="bg-chm-red text-white px-7 py-3 font-bold text-sm uppercase tracking-wide hover:bg-red-700 transition-colors">Call</a>
            <a href="sms:+12025792944" className="border-2 border-white text-white px-7 py-3 font-bold text-sm uppercase tracking-wide hover:border-chm-red hover:text-chm-red transition-colors">Text</a>
            <a href="https://wa.me/12025792944" className="border-2 border-white text-white px-7 py-3 font-bold text-sm uppercase tracking-wide hover:border-chm-red hover:text-chm-red transition-colors">WhatsApp</a>
            <a href="mailto:conveniencehubofmaryland@gmail.com" className="border-2 border-white text-white px-7 py-3 font-bold text-sm uppercase tracking-wide hover:border-chm-red hover:text-chm-red transition-colors">Email</a>
          </div>
          <p className="mt-6 text-gray-500 text-sm">Mon – Sat &nbsp;•&nbsp; 9 AM – 9 PM</p>
        </div>
      </section>
    </>
  )
}
