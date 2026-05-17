import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import type { Deal } from '@/lib/types'

export const runtime = 'edge'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Weekly Deals',
  description:
    'Weekly deals on laundry, cleaning, and home services. Discounts for nurses, students, expectant mothers, and bulk laundry orders.',
}

export default async function DealsPage() {
  const supabase = await createClient()
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  return (
    <div className="bg-white">
      <div className="bg-chm-red text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-red-200 text-xs font-bold uppercase tracking-widest mb-2">Save More</p>
          <h1 className="text-4xl md:text-5xl font-black">This Week&apos;s Deals</h1>
          <p className="mt-3 text-red-100 max-w-xl">
            Special pricing available every week. Contact us to redeem before booking.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
          {(deals as Deal[] ?? []).map((d) => (
            <div key={d.id} className="bg-white p-8">
              <span className="text-xs font-bold uppercase tracking-widest bg-chm-red text-white px-3 py-1 inline-block mb-4">
                {d.badge}
              </span>
              <h2 className="text-xl font-black text-chm-black mb-3">{d.headline}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{d.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-chm-black text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-chm-red text-xs font-bold uppercase tracking-widest mb-2">Free to Join</p>
            <p className="text-2xl font-black mb-1">Become a Member</p>
            <p className="text-gray-400 text-sm">Free signup. 2% off all recurring services. No expiry, no catches.</p>
          </div>
          <a
            href="https://wa.me/12025792944"
            className="shrink-0 bg-chm-red text-white px-8 py-3 font-bold text-sm uppercase tracking-wide hover:bg-red-700 transition-colors"
          >
            Sign Up Now
          </a>
        </div>

        <p className="mt-8 text-xs text-gray-400 leading-relaxed">
          * Deals valid for the current week only unless stated as ongoing. Cannot be combined with other offers unless specified. Contact us at 202-579-2944 to redeem.
        </p>
      </div>
    </div>
  )
}
