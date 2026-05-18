'use client'

import { useState } from 'react'
import AnimatedSection from '@/components/AnimatedSection'

const POSITIONS = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary & Housekeeping Staff',
  'Nanny / Childcare Staff',
  'Care Companion (Adult)',
  'Commercial Cleaner',
]
const DAYS  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = ['Morning (8 AM – 12 PM)', 'Afternoon (12 PM – 5 PM)', 'Evening (5 PM – 9 PM)', 'Flexible']
const STATES = [{ value: 'MD', label: 'Maryland' }, { value: 'VA', label: 'Virginia' }, { value: 'DC', label: 'Washington D.C.' }]

const WHY = [
  { icon: '◆', title: 'Flexible Hours',   desc: 'Work the schedule that fits your life — mornings, afternoons, or evenings.' },
  { icon: '★', title: 'Competitive Pay',  desc: 'Above-market rates with opportunities for recurring client bonuses.' },
  { icon: '✓', title: 'Vetted Team',      desc: 'Join a professional, background-checked team trusted by DMV families.' },
  { icon: '↑', title: 'Growth',           desc: 'Start in one role and expand into others as you grow with us.' },
]

export default function CareersPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', state: '',
    positions:  [] as string[],
    days:       [] as string[],
    hours:      '',
    experience: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggle(field: 'positions' | 'days', val: string) {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrMsg('')
    try {
      const res = await fetch('/api/careers', {
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
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Join Our Team</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Apply With Us
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            We&apos;re hiring professionals in Maryland, Virginia, and Washington D.C. Background-checked, flexible schedules, competitive pay.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">

        {/* Why work with us */}
        <AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
            {WHY.map((w, i) => (
              <AnimatedSection key={w.title} delay={i * 60}>
                <div className="bg-white p-8 hover:bg-cream transition-colors h-full">
                  <div className="text-chm-red text-xl mb-4">{w.icon}</div>
                  <p className="font-semibold text-chm-black text-sm uppercase tracking-widest mb-2">{w.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{w.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Application form */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Application</p>
            <h2 className="font-serif text-3xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Get Started
            </h2>
            <div className="w-10 h-px bg-chm-red mb-8" />

            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
                <p className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Application Received</p>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  Thank you for applying. We review applications within 2 business days and will reach out by phone or email.
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
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Location *</label>
                    <select required value={form.state} onChange={e => set('state', e.target.value)}
                      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
                      <option value="">Select state…</option>
                      {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Positions */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Position(s) Interested In *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {POSITIONS.map(p => (
                      <label key={p} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={form.positions.includes(p)} onChange={() => toggle('positions', p)}
                          className="w-4 h-4 accent-chm-red" />
                        <span className="text-sm text-chm-black group-hover:text-chm-red transition-colors">{p}</span>
                      </label>
                    ))}
                  </div>
                  <input type="text" className="sr-only" required={form.positions.length === 0}
                    value={form.positions.join(',')} readOnly aria-hidden tabIndex={-1} />
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Available Days</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {DAYS.map(d => (
                      <label key={d} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={form.days.includes(d)} onChange={() => toggle('days', d)}
                          className="w-4 h-4 accent-chm-red" />
                        <span className="text-sm text-chm-black group-hover:text-chm-red transition-colors">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Available Hours</label>
                  <select value={form.hours} onChange={e => set('hours', e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
                    <option value="">Select preference…</option>
                    {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Experience & Background</label>
                  <textarea rows={4} value={form.experience} onChange={e => set('experience', e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors resize-none"
                    placeholder="Tell us about your relevant experience, certifications, or anything else we should know…" />
                </div>

                {status === 'error' && <p className="text-chm-red text-sm">{errMsg}</p>}

                <button type="submit" disabled={status === 'submitting'}
                  className="bg-chm-red text-white px-10 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
                  {status === 'submitting' ? 'Submitting…' : 'Submit Application'}
                </button>

                <p className="text-xs text-gray-400 leading-relaxed">
                  We review all applications within 2 business days. Questions? Call or text 202-579-2944.
                </p>
              </form>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
