import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import type { Service, PricingItem } from '@/lib/types'

export const runtime = 'edge'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Services & Pricing',
  description:
    'Full pricing for professional cleaning, laundry pickup & delivery, culinary & housekeeping, and nanny & care services in the DMV area.',
}

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  return (
    <div className="bg-white">
      <div className="bg-chm-black text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-chm-red text-xs font-bold uppercase tracking-widest mb-2">What We Offer</p>
          <h1 className="text-4xl md:text-5xl font-black">Services & Pricing</h1>
          <p className="mt-3 text-gray-400 max-w-xl">
            All services available by calling, texting, or messaging us on WhatsApp at 202-579-2944.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        {(services as Service[] ?? []).map((service) => (
          <section key={service.id} id={service.slug}>
            <div className="w-8 h-1 bg-chm-red mb-5" />
            <h2 className="text-2xl md:text-3xl font-black text-chm-black mb-1">{service.title}</h2>
            {service.subtitle && (
              <p className="text-gray-500 text-sm mb-2">{service.subtitle}</p>
            )}
            {service.description && (
              <p className="text-gray-600 text-sm mb-8">{service.description}</p>
            )}

            {service.pricing_details && service.pricing_details.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
                {(service.pricing_details as PricingItem[]).map((item, i) => (
                  <div key={i} className="bg-white p-6">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{item.label}</p>
                    <p className="text-3xl font-black text-chm-red">
                      {item.price}
                      {item.unit && (
                        <span className="text-base font-normal text-gray-500">{item.unit}</span>
                      )}
                    </p>
                    {item.note && (
                      <p className="text-xs text-gray-400 mt-1">{item.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Laundry note */}
        <div className="bg-gray-50 border border-gray-200 p-5 -mt-10">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-chm-black">Laundry minimum:</span> 10 lbs &nbsp;•&nbsp; Mon–Sat 9 AM–9 PM
          </p>
        </div>

        {/* Book CTA */}
        <div className="border-t-4 border-chm-red pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xl font-black text-chm-black">Ready to get started?</p>
            <p className="text-gray-500 text-sm mt-1">Call, text, or message us — we&apos;ll handle the rest.</p>
          </div>
          <div className="flex gap-3">
            <a href="tel:+12025792944" className="border-2 border-chm-black text-chm-black px-6 py-2 font-bold text-sm uppercase hover:border-chm-red hover:text-chm-red transition-colors">Call</a>
            <a href="https://wa.me/12025792944" className="bg-chm-red text-white px-6 py-2 font-bold text-sm uppercase hover:bg-red-700 transition-colors">WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )
}
