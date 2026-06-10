import type { Metadata } from 'next'
import AnimatedSection from '@/components/AnimatedSection'
import { dbSelect } from '@/lib/db'
import type { Service, PricingItem } from '@/lib/types'


export const metadata: Metadata = {
  title: 'Services & Pricing | Cleaning, Laundry, Nanny & More — Convenience Hub of Maryland',
  description:
    'Full pricing for professional cleaning, laundry pickup & delivery, culinary & housekeeping, nanny & care, and commercial services in Maryland, Virginia & Washington D.C. Book online or call 202-579-2944.',
  keywords: [
    'cleaning service prices Maryland', 'laundry pickup delivery prices DMV',
    'maid service prices Virginia', 'house cleaning cost Maryland',
    'nanny services Maryland pricing', 'culinary housekeeping DMV',
    'commercial cleaning Maryland', 'home services near me DMV',
    'laundry service prices near me', 'move in move out cleaning Maryland',
  ],
  alternates: { canonical: 'https://www.conveniencehubofmaryland.com/services' },
}

const SERVICE_IMAGES: Record<string, string> = {
  cleaning:   '/service-cleaning.jpg',
  culinary:   '/service-culinary.jpg',
  laundry:    '/service-laundry.jpg',
  care:       '/service-care.jpg',
  commercial: '/commercial-hero.jpg',
}

// Static fallback — used when DB is empty
const STATIC_SERVICES: Service[] = [
  {
    id: 'laundry', slug: 'laundry', sort_order: 1, active: true, created_at: '',
    title: 'Premium Laundry Pickup & Delivery',
    subtitle: 'Pickup · Wash · Dry · Fold · Deliver',
    description: 'We pick up, wash, dry, fold, and deliver directly to your doorstep. Monday–Saturday 9 AM–9 PM. 10 lb minimum order. Free pickup and delivery.',
    price_from: 'From $3.99/lb',
    pricing_details: [
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Colors',           price: '$3.99', unit: '/lb' },
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Bedding & Linens', price: '$4.99', unit: '/lb' },
      { section: 'Regular Service (1–3 Day Delivery)', label: 'Whites',           price: '$6.99', unit: '/lb' },
      { section: 'Same Day Express Delivery',          label: 'Colors',           price: '$5.99', unit: '/lb' },
      { section: 'Same Day Express Delivery',          label: 'Bedding & Linens', price: '$6.99', unit: '/lb' },
      { section: 'Same Day Express Delivery',          label: 'Whites',           price: '$8.99', unit: '/lb' },
    ],
  },
  {
    id: 'cleaning', slug: 'cleaning', sort_order: 2, active: true, created_at: '',
    title: 'Professional Cleaning & Estate Care',
    subtitle: 'Residential · Commercial · Estate',
    description: 'Customized maintenance for residential estates, luxury apartments, and commercial operations. Market-adjusted for Virginia (NOVA), Maryland, and D.C. communities.',
    price_from: 'From $100/visit',
    pricing_details: [
      { section: 'Standard Residential Cleaning', label: 'Studio Apartment',      price: '$100–$150',  unit: 'per visit' },
      { section: 'Standard Residential Cleaning', label: '1 Bed / 1 Bath',        price: '$130–$200',  unit: 'per visit' },
      { section: 'Standard Residential Cleaning', label: '2 Bed / 2 Bath',        price: '$200–$250',  unit: 'per visit' },
      { section: 'Standard Residential Cleaning', label: '3 Bed / 2 Bath',        price: '$250–$350',  unit: 'per visit' },
      { section: 'Standard Residential Cleaning', label: '4+ Bed / Estate Scale', price: '$350–$450+', unit: 'per visit' },
      { section: 'Deep Cleaning Services',        label: 'Deep Clean Add-On',       price: '+$60–$110', note: 'Added to standard baseline rate' },
      { section: 'Deep Cleaning Services',        label: 'Full One-Time Deep Clean', price: '$250–$450', note: 'Based on sq footage & initial condition' },
      { section: 'Move-In / Move-Out Cleaning',   label: '1 Bedroom',   price: '$150–$250' },
      { section: 'Move-In / Move-Out Cleaning',   label: '2 Bedroom',   price: '$250–$350' },
      { section: 'Move-In / Move-Out Cleaning',   label: '3 Bedroom',   price: '$350–$450' },
      { section: 'Move-In / Move-Out Cleaning',   label: '4+ Bed / Luxury', price: '$380–$500+' },
      { section: 'Hourly & Recurring Estate Care', label: 'Shift ≤4 Hours',              price: '$54.99',          unit: '/hr' },
      { section: 'Hourly & Recurring Estate Care', label: 'Shift 5+ Hours',              price: '$49.99',          unit: '/hr' },
      { section: 'Hourly & Recurring Estate Care', label: 'Executive Residency Plan',    price: 'Custom Quote',    note: '5-day/week dedicated schedule' },
      { section: 'Hourly & Recurring Estate Care', label: 'Weekly / Bi-weekly / Monthly', price: 'Discounted Rates', note: 'Contact for custom quote' },
      { section: 'À La Carte Add-Ons', label: 'Inside Oven / Grill',         price: '$25–$45' },
      { section: 'À La Carte Add-Ons', label: 'Inside Refrigerator/Freezer', price: '$25–$45' },
      { section: 'À La Carte Add-Ons', label: 'Interior Windows & Tracks',   price: '$35–$80' },
      { section: 'À La Carte Add-Ons', label: 'Heavy Pet Hair Removal',      price: '$20–$55' },
      { section: 'À La Carte Add-Ons', label: 'Post-Event Heavy Condition',  price: '$40–$90' },
    ],
  },
  {
    id: 'culinary', slug: 'culinary', sort_order: 3, active: true, created_at: '',
    title: 'Culinary, Housekeeping & Household Management',
    subtitle: 'Meal Prep · Tidying · Laundry · Errands',
    description: 'Complete estate support including light cooking, custom meal prep, tidying, daily laundry, errand running, and deep organizational overhauls. 6-hour minimum.',
    price_from: 'From $50/hr',
    pricing_details: [
      { section: 'Rates', label: 'Custom Hourly Rate',        price: '$50–$60',     unit: '/hr',    note: '6-hour minimum' },
      { section: 'Rates', label: '5-Day Specialized Support', price: 'Custom Quote',                note: 'Dedicated staff for total household ownership' },
      { section: 'Rates', label: 'Errands & Concierge',       price: '$0.725',      unit: '/mile',  note: 'IRS standard business rate' },
    ],
  },
  {
    id: 'care', slug: 'care', sort_order: 4, active: true, created_at: '',
    title: 'Premium Nanny & Housekeeping Services',
    subtitle: 'Childcare · Companionship · Adult Care',
    description: "Comprehensive childcare, companionship, and integrated household support. All personnel are strictly vetted — background-checked, CPR-certified, and fully vaccinated.",
    price_from: 'Custom Quote',
    pricing_details: [
      { section: 'Placement Packages', label: 'Nanny / Childcare',          price: 'Custom Quote', note: 'Tailored to family schedule & routines' },
      { section: 'Placement Packages', label: 'Companionship & Adult Care', price: 'Custom Quote', note: 'Background checked, CPR certified staff' },
    ],
  },
  {
    id: 'commercial', slug: 'commercial', sort_order: 5, active: true, created_at: '',
    title: 'Commercial Operations & Special Projects',
    subtitle: 'Offices · Retail · Warehouses · Post-Construction',
    description: 'Corporate offices, retail spaces, warehouses, and post-construction cleaning projects are custom-quoted per project scope.',
    price_from: 'Custom Quote',
    pricing_details: [
      { section: 'Billing Structure', label: 'All Commercial Work', price: 'Custom Quote', note: 'Quoted per project scope' },
    ],
  },
]

function groupBySections(items: PricingItem[]): { name: string; items: PricingItem[] }[] {
  const map = new Map<string, PricingItem[]>()
  for (const item of items) {
    const sec = item.section?.trim() || 'Pricing'
    if (!map.has(sec)) map.set(sec, [])
    map.get(sec)!.push(item)
  }
  return Array.from(map.entries()).map(([name, items]) => ({ name, items }))
}

const CUSTOM_QUOTE_MAIL = (label: string) =>
  `mailto:conveniencehubofmaryland@gmail.com?subject=${encodeURIComponent(`Custom Quote Request — ${label}`)}&body=${encodeURIComponent(`Hi Convenience Hub of Maryland,\n\nI am interested in a custom quote for: ${label}\n\nPlease find my details below:\n\n- Name: \n- Phone: \n- Location (MD / VA / DC): \n- Preferred schedule or frequency: \n- Property size or special requirements: \n- Best time to reach me: \n\nThank you!`)}`

export default async function ServicesPage() {
  const dbServices = await dbSelect<Service>('services', { active: 'eq.true', order: 'sort_order' })
  const services = dbServices.length > 0 ? dbServices : STATIC_SERVICES

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

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">
        {services.map((service, idx) => {
          const sections = groupBySections(service.pricing_details ?? [])
          return (
            <AnimatedSection key={service.id} delay={idx * 80}>
              <section id={service.slug ?? service.id}>
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
                <h2 className="font-serif text-3xl md:text-4xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  {service.title}
                </h2>
                {service.subtitle && (
                  <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">{service.subtitle}</p>
                )}
                {service.description && (
                  <p className="text-gray-600 text-sm mb-8 max-w-2xl leading-relaxed">{service.description}</p>
                )}

                <div className="space-y-6">
                  {sections.map((sec, si) => (
                    <div key={si}>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3 pb-2 border-b border-gray-100">
                        {sec.name}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
                        {sec.items.map((item, i) => (
                          <div key={i} className="bg-white p-6 hover:bg-cream transition-colors">
                            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                            <p className="font-serif text-2xl font-bold text-chm-red" style={{ fontFamily: 'var(--font-serif)' }}>
                              {item.price === 'Custom Quote' ? (
                                <a href={CUSTOM_QUOTE_MAIL(item.label)} className="hover:underline underline-offset-4">
                                  Custom Quote
                                </a>
                              ) : (
                                <>{item.price}{item.unit && <span className="text-base font-normal text-gray-400 ml-1">{item.unit}</span>}</>
                              )}
                            </p>
                            {item.note && <p className="text-xs text-gray-400 mt-2">{item.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </AnimatedSection>
          )
        })}

        {/* Policies */}
        <AnimatedSection>
          <div className="bg-cream border border-gray-100 p-8 space-y-6">
            <div>
              <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Policies</p>
              <h2 className="font-serif text-2xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
                Booking &amp; Operational Standards
              </h2>
              <div className="w-10 h-px bg-chm-red mt-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-600 leading-relaxed">
              <div>
                <p className="font-semibold text-chm-black mb-1">Deposits</p>
                <p>A non-refundable deposit may be required to secure single high-intensity deep cleans or move-out services.</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-1">Cancellations &amp; Rescheduling</p>
                <p>24-hour notice required. Late cancellations are subject to a $50 fee or up to 50% of the estimated service value.</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-1">Lock-Out Policy</p>
                <p>If our team cannot access the property within 30 minutes of the scheduled window, a lock-out fee equivalent to the cancellation fee applies.</p>
              </div>
              <div>
                <p className="font-semibold text-chm-black mb-1">Staff Standards</p>
                <p>Every team member is rigorously background-checked, CPR-certified, and fully vaccinated.</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="bg-cream border border-gray-100 p-5">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-chm-black">Laundry minimum:</span> 10 lbs &nbsp;•&nbsp; Mon–Sat 9 AM–9 PM
          </p>
        </div>

        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="font-serif text-2xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
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
