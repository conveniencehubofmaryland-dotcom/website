'use client'
import { useState } from 'react'
const DAYS  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const HOURS = ['Morning (8 AM – 12 PM)', 'Afternoon (12 PM – 5 PM)', 'Evening (5 PM – 9 PM)', 'Flexible']
const STATES = [{ value: 'MD', label: 'Maryland' }, { value: 'VA', label: 'Virginia' }, { value: 'DC', label: 'Washington D.C.' }]
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
interface Props {
  positions: string[]
}
export default function CareersForm({ positions }: Props) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address: '', city: '', state: '', gender: '',
    positions: [] as string[],
    days:      [] as string[],
    hours:     '',
    experience: '',
    has_license: '',
    has_insured_car: '',
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
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
  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        <p className="font-serif text-2xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Application Received</p>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Thank you for applying. We review applications within 2 business days and will reach out by phone or email.
        </p>
      </div>
    )
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Name + Phone */}
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
      {/* Email + Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email *</label>
          <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
            placeholder="jane@example.com" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Gender</label>
          <select value={form.gender} onChange={e => set('gender', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
            <option value="">Select…</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
      {/* Address + City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Street Address</label>
          <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
            placeholder="123 Main St" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">City</label>
          <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
            placeholder="Silver Spring" />
        </div>
      </div>
      {/* State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">State *</label>
          <select required value={form.state} onChange={e => set('state', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
            <option value="">Select state…</option>
            {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      {/* NEW: License + Insured Car */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Do you have an active license? *</label>
          <select required value={form.has_license} onChange={e => set('has_license', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
            <option value="">Select…</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Do you own an insured car? *</label>
          <select required value={form.has_insured_car} onChange={e => set('has_insured_car', e.target.value)}
            className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
            <option value="">Select…</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
      {/* Positions */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-3">Position(s) Interested In *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {positions.map(p => (
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
      {/* Availability — days */}
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
      {/* Available hours */}
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
      {/* Resume Upload */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Attach Resume (PDF, DOC, DOCX)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={e => setResumeFile(e.target.files?.[0] ?? null)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white"
        />
        {resumeFile && <p className="text-xs text-gray-400 mt-1">Selected: {resumeFile.name}</p>}
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
  )
}
