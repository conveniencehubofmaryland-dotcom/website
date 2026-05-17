import type { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import type { ContactInfo, BusinessHour } from '@/lib/types'

export const runtime = 'edge'
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Reach Convenience Hub of Maryland by phone, text, WhatsApp, or email. Available Mon–Sat 9am–9pm.',
}

export default async function ContactPage() {
  const supabase = await createClient()

  const [{ data: contacts }, { data: hours }] = await Promise.all([
    supabase.from('contact_info').select('*').order('sort_order'),
    supabase.from('business_hours').select('*').order('day_order'),
  ])

  const ctaLabel: Record<string, string> = {
    phone:    'Call Now',
    sms:      'Send Text',
    whatsapp: 'Open WhatsApp',
    email:    'Send Email',
  }

  const openDays = (hours as BusinessHour[] ?? []).filter((h) => h.is_open)
  const firstOpen = openDays[0]
  const lastOpen  = openDays[openDays.length - 1]

  return (
    <div className="bg-white">
      <div className="bg-chm-black text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-chm-red text-xs font-bold uppercase tracking-widest mb-2">We&apos;re Here</p>
          <h1 className="text-4xl md:text-5xl font-black">Contact Us</h1>
          <p className="mt-3 text-gray-400 max-w-xl">
            Multiple ways to reach us — pick what works best for you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
          {(contacts as ContactInfo[] ?? []).map((c) => (
            <div key={c.id} className="bg-white p-8 flex flex-col justify-between gap-6">
              <div>
                <div className="w-8 h-1 bg-chm-red mb-5" />
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{c.label}</p>
                <p className="text-xl font-black text-chm-black break-all">{c.value}</p>
              </div>
              <a
                href={c.href}
                className="self-start bg-chm-red text-white px-6 py-2 font-bold text-sm uppercase tracking-wide hover:bg-red-700 transition-colors"
              >
                {ctaLabel[c.key] ?? c.label}
              </a>
            </div>
          ))}
        </div>

        {/* Hours */}
        <div className="mt-12 border-l-4 border-chm-red pl-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Hours of Operation</p>
          {firstOpen && lastOpen ? (
            <>
              <p className="text-2xl font-black text-chm-black">
                {firstOpen.day_name} – {lastOpen.day_name}
              </p>
              <p className="text-chm-red font-bold text-xl">
                {firstOpen.open_time?.replace(':','').replace(/^0/,'')} – {firstOpen.close_time?.replace(':','').replace(/^0/,'')}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black text-chm-black">Monday – Saturday</p>
              <p className="text-chm-red font-bold text-xl">9:00 AM – 9:00 PM</p>
            </>
          )}
          <p className="text-gray-500 text-sm mt-2">Serving Maryland, Virginia & Washington D.C.</p>
        </div>
      </div>
    </div>
  )
}
