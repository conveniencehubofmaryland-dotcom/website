import type { Metadata } from 'next'
import { dbSelect } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Gallery — Before & After | Convenience Hub of Maryland',
  description: 'See the transformation. Real before-and-after results from our cleaning, laundry, culinary, care, and commercial services across Maryland, Virginia, and Washington D.C.',
}

type GalleryItem = {
  id: string
  service_category: string
  title: string
  before_image_url: string
  after_image_url: string
  sort_order: number
}

const CATEGORY_LABELS: Record<string, string> = {
  cleaning: 'Cleaning & Estate Care',
  laundry: 'Laundry',
  culinary: 'Culinary & Housekeeping',
  care: 'Nanny & Care',
  commercial: 'Commercial & Special Projects',
}

const CATEGORY_ORDER = ['laundry', 'cleaning', 'culinary', 'care', 'commercial']

function groupByCategory(items: GalleryItem[]): { category: string; items: GalleryItem[] }[] {
  const map = new Map<string, GalleryItem[]>()
  for (const item of items) {
    if (!map.has(item.service_category)) map.set(item.service_category, [])
    map.get(item.service_category)!.push(item)
  }
  return CATEGORY_ORDER.filter(cat => map.has(cat)).map(cat => ({
    category: cat,
    items: map.get(cat)!,
  }))
}

export default async function GalleryPage() {
  const items = await dbSelect<GalleryItem>('gallery_items', {
    select: '*',
    active: 'eq.true',
    order: 'service_category.asc,sort_order.asc',
  })

  const sections = groupByCategory(items)

  return (
    <div className="bg-white">
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Our Work</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black">Before &amp; After</h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Real results from real jobs across Maryland, Virginia, and Washington D.C.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">
        {sections.length === 0 && (
          <p className="text-gray-500 text-center py-12">Gallery coming soon — check back shortly.</p>
        )}

        {sections.map(section => (
          <div key={section.category}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-px bg-chm-red" />
              <h2 className="font-serif text-3xl text-chm-black">
                {CATEGORY_LABELS[section.category] ?? section.category}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.items.map(item => (
                <div key={item.id} className="border border-gray-100 rounded overflow-hidden">
                  <div className="grid grid-cols-2">
                    <div className="relative">
                      <img src={item.before_image_url} alt={`${item.title} — before`} className="w-full h-48 object-cover" />
                      <span className="absolute top-2 left-2 bg-chm-black/80 text-white text-[10px] uppercase tracking-widest px-2 py-1">Before</span>
                    </div>
                    <div className="relative">
                      <img src={item.after_image_url} alt={`${item.title} — after`} className="w-full h-48 object-cover" />
                      <span className="absolute top-2 left-2 bg-chm-red/90 text-white text-[10px] uppercase tracking-widest px-2 py-1">After</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-chm-black p-4">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
