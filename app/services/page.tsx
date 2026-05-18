import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import type { Service, PricingItem } from '@/lib/types'
import AnimatedSection from '@/components/AnimatedSection'

const SERVICE_IMAGES: Record<string, string> = {
  cleaning:   'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=75',
  culinary:   'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=75',
  laundry:    'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=75',
  care:       'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=1200&q=75',
  commercial: '/commercial-hero.jpg',
}

export const runtime = 'edge'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Services & Pricing',
  description:
    'Full pricing for professional cleaning, laundry pickup & delivery, culinary & housekeeping, and nanny & care services in the DMV area.',
}

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: services } = await supabase.from('services').select('*').eq('active', true).order('sort_order')

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">What We Offer</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Services &amp; Pricing
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            All services available by calling, texting, or messaging us on WhatsApp at 202-579-2944.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-12">
        {(services as Service[] ?? []).map((service, idx) => (
          <AnimatedSection key={service.id} delay={idx * 80}>
            <section id={service.slug}>
              {/* Service image */}
              {SERVICE_IMAGES[service.slug] && (
                <div className="relative overflow-hidden h-64 md:h-80 mb-8">
                  <img
                    src={SERVICE_IMAGES[service.slug]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                </div>
              )}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-8 h-px bg-chm-red" />
                <span className="text-chm-red text-lg">✿</span>
              </div>
              <h2
                className="font-serif text-3xl md:text-4xl text-chm-black mb-2"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {service.title}
              </h2>
              {service.subtitle && <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">{service.subtitle}</p>}
              {service.description && <p className="text-gray-600 text-sm mb-8 max-w-2xl leading-relaxed">{service.description}</p>}

              {service.pricing_details && service.pricing_details.length > 0 && (() => {
                // Group items by section
                const sections: { name: string | null; items: PricingItem[] }[] = []
                for (const item of service.pricing_details as PricingItem[]) {
                  const sec = item.section ?? null
                  const last = sections[sections.length - 1]
                  if (!last || last.name !== sec) {
                    sections.push({ name: sec, items: [item] })
                  } else {
                    last.items.push(item)
                  }
                }
                return (
                  <div className="space-y-6">
                    {sections.map((sec, si) => (
                      <div key={si}>
                        {sec.name && (
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3 pb-2 border-b border-gray-100">
                            {sec.name}
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
                          {sec.items.map((item, i) => (
                            <div key={i} className="bg-white p-6 hover:bg-blush transition-colors">
                              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                              <p className="font-serif text-2xl font-bold text-chm-red" style={{ fontFamily: 'var(--font-serif)' }}>
                                {item.price}
                                {item.unit && <span className="text-base font-normal text-gray-400 ml-1">{item.unit}</span>}
                              </p>
                              {item.note && <p className="text-xs text-gray-400 mt-2">{item.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </section>
          </AnimatedSection>
        ))}

        <div className="bg-cream border border-gray-100 p-5">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-chm-black">Laundry minimum:</span> 10 lbs &nbsp;•&nbsp; Mon–Sat 9 AM–9 PM
          </p>
        </div>

        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p
                className="font-serif text-2xl text-chm-black"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Ready to get started?
              </p>
              <p className="text-gray-500 text-sm mt-1">Call, text, or message us — we&apos;ll handle the rest.</p>
            </div>
            <div className="flex gap-3">
              <a href="tel:+12025792944" className="border border-chm-black/30 text-chm-black px-6 py-2.5 font-semibold text-sm uppercase tracking-wide hover:border-chm-red hover:text-chm-red transition-colors">Call</a>
              <a href="https://wa.me/12025792944" className="bg-chm-red text-white px-6 py-2.5 font-semibold text-sm uppercase tracking-wide hover:bg-red-700 transition-colors">WhatsApp</a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
