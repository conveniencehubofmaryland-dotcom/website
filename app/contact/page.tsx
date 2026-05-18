import type { Metadata } from 'next'
import { dbSelect } from '@/lib/db'
import type { ContactInfo, BusinessHour } from '@/lib/types'
import AnimatedSection from '@/components/AnimatedSection'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Reach Convenience Hub of Maryland by phone, text, WhatsApp, or email. Available Mon–Sat 9am–9pm.',
}

export default async function ContactPage() {
  const [contacts, hours] = await Promise.all([
    dbSelect<ContactInfo>('contact_info', { order: 'sort_order' }),
    dbSelect<BusinessHour>('business_hours', { order: 'day_order' }),
  ])

  const ctaLabel: Record<string, string> = {
    phone:    'Call Now',
    sms:      'Send Text',
    whatsapp: 'Open WhatsApp',
    email:    'Send Email',
  }

  const openDays = (hours ?? []).filter((h) => h.is_open)
  const firstOpen = openDays[0]
  const lastOpen  = openDays[openDays.length - 1]

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">We&apos;re Here</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Contact Us
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Multiple ways to reach us — pick what works best for you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-10">
        {/* Contact methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
          {(contacts ?? []).map((c, i) => (
            <AnimatedSection key={c.id} delay={i * 80}>
              <div className="bg-white p-8 hover:bg-blush transition-colors flex flex-col justify-between gap-6 h-full">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-6 h-px bg-chm-red" />
                    <span className="text-chm-red text-xs font-semibold uppercase tracking-widest">{c.label}</span>
                  </div>
                  <p
                    className="font-serif text-2xl text-chm-black break-all"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    {c.value}
                  </p>
                </div>
                <a
                  href={c.href}
                  className="self-start border border-chm-black/20 text-chm-black px-6 py-2 font-semibold text-sm uppercase tracking-wide hover:border-chm-red hover:text-chm-red transition-colors"
                >
                  {ctaLabel[c.key] ?? c.label}
                </a>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Hours */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.2em] mb-4">Hours of Operation</p>
            {firstOpen && lastOpen ? (
              <>
                <p
                  className="font-serif text-3xl text-chm-black mb-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {firstOpen.day_name} – {lastOpen.day_name}
                </p>
                <p className="text-chm-red font-semibold text-xl">
                  {firstOpen.open_time?.replace(':','').replace(/^0/,'')} – {firstOpen.close_time?.replace(':','').replace(/^0/,'')}
                </p>
              </>
            ) : (
              <>
                <p
                  className="font-serif text-3xl text-chm-black mb-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Monday – Saturday
                </p>
                <p className="text-chm-red font-semibold text-xl">9:00 AM – 9:00 PM</p>
              </>
            )}
            <p className="text-gray-400 text-sm mt-3 tracking-wide">Maryland • Virginia • Washington D.C.</p>
          </div>
        </AnimatedSection>

        {/* CTA strip */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p
                className="font-serif text-2xl text-chm-black"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Ready to book?
              </p>
              <p className="text-gray-500 text-sm mt-1">Message us on WhatsApp — fastest response.</p>
            </div>
            <a
              href="https://wa.me/12025792944"
              className="bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Book via WhatsApp
            </a>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
