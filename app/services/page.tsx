import { dbSelect } from '@/lib/db'
import Link from 'next/link'

export const metadata = { title: 'Services - Convenience Hub of Maryland' }

export default async function ServicesPage() {
  const services = await dbSelect('services', {
    select: '*',
    order: 'sort_order.asc',
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-5xl text-chm-black text-center mb-4">Services</h1>
      <p className="text-center text-gray-600 text-lg mb-12">Luxury home services designed for your lifestyle</p>

      <div className="space-y-12">
        {services.map((service, idx) => (
          <div key={service.id} className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
            <div className="flex-1 bg-gradient-to-br from-chm-black to-gray-800 rounded-lg h-80 flex items-center justify-center">
              <span className="text-8xl opacity-80">✨</span>
            </div>

            <div className="flex-1">
              <h2 className="font-serif text-4xl text-chm-black mb-3">{service.title}</h2>
              <p className="text-chm-red font-semibold text-lg mb-4">{service.subtitle}</p>
              <p className="text-gray-700 text-base leading-relaxed mb-6">{service.description}</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded p-6 mb-6">
                <div className="text-3xl font-bold text-chm-red mb-2">From ${service.price_from}</div>
                <p className="text-gray-600 text-sm">Premium service included</p>
              </div>

              <Link href="/quote" className="inline-block bg-chm-red text-white px-8 py-3 font-semibold hover:bg-red-700 transition-colors">
                Get a Quote
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
