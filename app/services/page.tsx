import type { Metadata } from 'next'
import AnimatedSection from '@/components/AnimatedSection'


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

type PricingItem = { label: string; price: string; unit?: string; note?: string }
type PricingSection = { name: string; items: PricingItem[] }

const SERVICES: {
  slug: string
  title: string
  subtitle: string
  description: string
  sections: PricingSection[]
}[] = [
  {
    slug: 'laundry',
    title: 'Premium Laundry Pickup & Delivery',
    subtitle: 'Pickup · Wash · Dry · Fold · Deliver',
    description:
      'We pick up, wash, dry, fold, and deliver directly to your doorstep. Monday–Saturday 9 AM–9 PM. 10 lb minimum order.',
    sections: [
      {
        name: 'Regular Service (1–3 Day Delivery)',
        items: [
          { label: 'Colors',          price: '$3.99', unit: '/lb' },
          { label: 'Bedding & Linens', price: '$4.99', unit: '/lb' },
          { label: 'Whites',          price: '$6.99', unit: '/lb' },
        ],
      },
      {
        name: 'Same Day Express Delivery',
        items: [
          { label: 'Colors',          price: '$5.99', unit: '/lb' },
          { label: 'Bedding & Linens', price: '$6.99', unit: '/lb' },
          { label: 'Whites',          price: '$8.99', unit: '/lb' },
        ],
      },
    ],
  },
  {
    slug: 'cleaning',
    title: 'Professional Cleaning & Estate Care',
    subtitle: 'Residential · Commercial · Estate',
    description:
      'Customized maintenance for residential estates, luxury apartments, and commercial operations. Market-adjusted for Virginia (NOVA), Maryland, and D.C. communities.',
    sections: [
      {
        name: 'Standard Residential Cleaning',
        items: [
          { label: 'Studio Apartment',     price: '$100–$150',   unit: 'per visit' },
          { label: '1 Bed / 1 Bath',       price: '$130–$200',   unit: 'per visit' },
          { label: '2 Bed / 2 Bath',       price: '$200–$250',   unit: 'per visit' },
          { label: '3 Bed / 2 Bath',       price: '$250–$350',   unit: 'per visit' },
          { label: '4+ Bed / Estate Scale', price: '$350–$450+', unit: 'per visit' },
        ],
      },
      {
        name: 'Deep Cleaning Services',
        items: [
          { label: 'Deep Clean Add-On',        price: '+$60–$110',  note: 'Added to standard baseline rate' },
          { label: 'Full One-Time Deep Clean',  price: '$250–$450',  note: 'Based on sq footage & initial condition' },
        ],
      },
      {
        name: 'Move-In / Move-Out Cleaning',
        items: [
          { label: '1 Bedroom',              price: '$150–$250' },
          { label: '2 Bedroom',              price: '$250–$350' },
          { label: '3 Bedroom',              price: '$350–$450' },
          { label: '4+ Bed / Luxury',        price: '$380–$500+' },
        ],
      },
      {
        name: 'Hourly & Recurring Estate Care',
        items: [
          { label: 'Shift ≤4 Hours',              price: '$54.99', unit: '/hr' },
          { label: 'Shift 5+ Hours',              price: '$49.99', unit: '/hr' },
          { label: 'Executive Residency Plan',    price: 'Custom Quote', note: '5-day/week dedicated schedule' },
          { label: 'Weekly / Bi-weekly / Monthly', price: 'Discounted Rates', note: 'Contact for custom quote' },
        ],
      },
      {
        name: 'À La Carte Add-Ons',
        items: [
          { label: 'Inside Oven / Grill',          price: '$25–$45' },
          { label: 'Inside Refrigerator/Freezer',  price: '$25–$45' },
          { label: 'Interior Windows & Tracks',    price: '$35–$80' },
          { label: 'Heavy Pet Hair Removal',        price: '$20–$55' },
          { label: 'Post-Event Heavy Condition',   price: '$40–$90' },
        ],
      },
    ],
  },
  {
    slug: 'culinary',
    title: 'Culinary, Housekeeping & Household Management',
    subtitle: 'Meal Prep · Tidying · Laundry · Errands',
    description:
      'Complete estate support including light cooking, custom meal prep, tidying, daily laundry, errand running, and deep organizational overhauls. 6-hour minimum. Final rate negotiable based on estate square footage and task complexity.',
    sections: [
      {
        name: 'Rates',
        items: [
          { label: 'Custom Hourly Rate',        price: '$50–$60',     unit: '/hr', note: '6-hour minimum' },
          { label: '5-Day Specialized Support', price: 'Custom Quote', note: 'Dedicated staff for total household ownership' },
          { label: 'Errands & Concierge',       price: '$0.725',       unit: '/mile', note: 'IRS standard business rate' },
        ],
      },
    ],
  },
  {
    slug: 'care',
    title: 'Premium Nanny & Housekeeping Services',
    subtitle: 'Childcare · Companionship · Adult Care',
    description:
      'Comprehensive childcare, companionship, and integrated household support. All personnel are strictly vetted — background-checked, CPR-certified, and fully vaccinated. Pricing is customized to your family\'s schedule, routines, and specialized care needs.',
    sections: [
      {
        name: 'Placement Packages',
        items: [
          { label: 'Nanny / Childcare',       price: 'Custom Quote', note: 'Tailored to family schedule & routines' },
          { label: 'Companionship & Adult Care', price: 'Custom Quote', note: 'Background checked, CPR certified staff' },
        ],
      },
    ],
  },
  {
    slug: 'commercial',
    title: 'Commercial Operations & Special Projects',
    subtitle: 'Offices · Retail · Warehouses · Post-Construction',
    description:
      'Corporate offices, retail spaces, warehouses, and post-construction cleaning projects are custom-quoted per project scope.',
    sections: [
      {
        name: 'Billing Structure',
        items: [
          { label: 'All Commercial Work',  price: 'Custom Quote', note: 'Quoted per project scope' },
        ],
      },
    ],
  },
]

export default function ServicesPage() {
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
        {SERVICES.map((service, idx) => (
          <AnimatedSection key={service.slug} delay={idx * 80}>
            <section id={service.slug}>
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
              <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">{service.subtitle}</p>
              <p className="text-gray-600 text-sm mb-8 max-w-2xl leading-relaxed">{service.description}</p>

              <div className="space-y-6">
                {service.sections.map((sec, si) => (
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
                              <a href="mailto:conveniencehubofmaryland@gmail.com" className="hover:underline underline-offset-4">Custom Quote</a>
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
        ))}

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
                <p className="font-semibold text-chm-black mb-1">Cancellations & Rescheduling</p>
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
