'use client'

import { useState } from 'react'
import AnimatedSection from '@/components/AnimatedSection'


// Next.js metadata can't be exported from a 'use client' file — set it in a parent or use Head.
// Title/desc are handled by layout.tsx template pattern.

const CONTACT_METHODS = [
  { label: 'Phone',     value: '202-579-2944',                           href: 'tel:+12025792944',                   cta: 'Call Now'         },
  { label: 'Text',      value: '202-579-2944',                           href: 'sms:+12025792944',                   cta: 'Send Text'        },
  { label: 'WhatsApp',  value: '202-579-2944',                           href: 'https://wa.me/12025792944',          cta: 'Open WhatsApp'    },
  { label: 'Email',     value: 'conveniencehubofmaryland@gmail.com',     href: 'mailto:conveniencehubofmaryland@gmail.com', cta: 'Send Email' },
]

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrMsg('')
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : {}
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

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

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">
        {/* Contact method tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100">
          {CONTACT_METHODS.map((c, i) => (
            <AnimatedSection key={c.label} delay={i * 80}>
              <div className="bg-white p-8 hover:bg-cream transition-colors flex flex-col justify-between gap-6 h-full">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-6 h-px bg-chm-red" />
                    <span className="text-chm-red text-xs font-semibold uppercase tracking-widest">{c.label}</span>
                  </div>
                  <p className="font-serif text-2xl text-chm-black break-all" style={{ fontFamily: 'var(--font-serif)' }}>
                    {c.value}
                  </p>
                </div>
                <a href={c.href} className="self-start border border-chm-black/20 text-chm-black px-6 py-2 font-semibold text-sm uppercase tracking-wide hover:border-chm-red hover:text-chm-red transition-colors">
                  {c.cta}
                </a>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Hours */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.2em] mb-4">Hours of Operation</p>
            <p className="font-serif text-3xl text-chm-black mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              Monday – Saturday
            </p>
            <p className="text-chm-red font-semibold text-xl">9:00 AM – 9:00 PM</p>
            <p className="text-gray-400 text-sm mt-3 tracking-wide">Maryland • Virginia • Washington D.C.</p>
          </div>
        </AnimatedSection>

        {/* Contact form */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Send a Message</p>
            <h2 className="font-serif text-3xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Get in Touch
            </h2>
            <div className="w-10 h-px bg-chm-red mb-8" />

            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
                <p className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Message Sent</p>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">We&apos;ll get back to you within 1 hour during business hours (Mon–Sat, 9 AM–9 PM).</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Name *</label>
                    <input required type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors"
                      placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors"
                      placeholder="202-555-0100" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors"
                    placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => set('message', e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors resize-none"
                    placeholder="Tell us what you need…" />
                </div>
                {status === 'error' && <p className="text-chm-red text-sm">{errMsg}</p>}
                <button type="submit" disabled={status === 'submitting'}
                  className="bg-chm-red text-white px-10 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
                  {status === 'submitting' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
