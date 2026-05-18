'use client'

import { useState } from 'react'
import AnimatedSection from '@/components/AnimatedSection'

const SERVICES   = ['Laundry Pickup & Delivery', 'Professional Cleaning', 'Culinary & Housekeeping', 'Nanny & Care Services', 'Commercial Projects']
const FREQUENCIES = ['Weekly', 'Bi-weekly', 'Monthly', 'As needed']
const STATES     = [{ value: 'MD', label: 'Maryland' }, { value: 'VA', label: 'Virginia' }, { value: 'DC', label: 'Washington D.C.' }]

const PERKS = [
  { icon: '★', title: 'Priority Booking',   desc: 'First access to available time slots before the general public.' },
  { icon: '◆', title: 'Exclusive Deals',    desc: 'Member-only weekly deals and promotions on all services.' },
  { icon: '↻', title: 'Recurring Discounts', desc: '2% off all recurring service bookings for active members.' },
  { icon: '✓', title: 'Free Signup',         desc: 'No cost to join — membership is completely free.' },
]

export default function MembershipPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', state: '',
    services:   [] as string[],
    frequency:  '',
    recurring:  false,
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleService(s: string) {
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrMsg('')
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Free to Join</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Become a Member
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Free membership. Priority booking, exclusive deals, and recurring discounts — all for signing up.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">

        {/* Perks grid */}
        <AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
            {PERKS.map((p, i) => (
              <AnimatedSection key={p.title} delay={i * 60}>
                <div className="bg-white p-8 hover:bg-cream transition-colors h-full">
                  <div className="text-chm-red text-xl mb-4">{p.icon}</div>
                  <p className="font-semibold text-chm-black text-sm uppercase tracking-widest mb-2">{p.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{p.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Form */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Sign Up</p>
            <h2 className="font-serif text-3xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Join Today
            </h2>
            <div className="w-10 h-px bg-chm-red mb-8" />

            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
                <p className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Welcome to CHM</p>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  You&apos;re now a member. We&apos;ll be in touch shortly with your exclusive member benefits.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name *</label>
                    <input required type="text" value={form.name} onChange={e => set('name', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
                      placeholder="Jane Smith" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone *</label>
                    <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
                      placeholder="202-555-0100" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email *</label>
                    <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
                      placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">State / Location *</label>
                    <select required value={form.state} onChange={e => set('state', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
                      <option value="">Select state…</option>
                      {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Services You&apos;re Interested In</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICES.map(s => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggleService(s)}
                          className="w-4 h-4 accent-chm-red" />
                        <span className="text-sm text-chm-black group-hover:text-chm-red transition-colors">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Service Frequency</label>
                    <select value={form.frequency} onChange={e => set('frequency', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
                      <option value="">Select frequency…</option>
                      {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer mt-6">
                      <input type="checkbox" checked={form.recurring} onChange={e => set('recurring', e.target.checked)}
                        className="w-4 h-4 accent-chm-red" />
                      <span className="text-sm text-chm-black">I want recurring service</span>
                    </label>
                  </div>
                </div>

                {status === 'error' && <p className="text-chm-red text-sm">{errMsg}</p>}

                <button type="submit" disabled={status === 'submitting'}
                  className="bg-chm-red text-white px-10 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
                  {status === 'submitting' ? 'Submitting…' : 'Join for Free'}
                </button>

                <p className="text-xs text-gray-400 leading-relaxed">
                  No fees. No commitment. Cancel anytime by calling or texting 202-579-2944.
                </p>
              </form>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
