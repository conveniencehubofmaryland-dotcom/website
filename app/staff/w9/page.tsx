'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SignaturePad from '@/components/SignaturePad'

const TAX_OPTIONS = [
  { value: 'individual', label: 'Individual / sole proprietor' },
  { value: 'single_member_llc', label: 'Single-member LLC' },
  { value: 'c_corp', label: 'C Corporation' },
  { value: 's_corp', label: 'S Corporation' },
  { value: 'partnership', label: 'Partnership / multi-member LLC' },
  { value: 'other', label: 'Other' },
]

const inputClass = 'w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-black'

export default function StaffW9Page() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [trained, setTrained] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    tax_classification: '',
    address: '',
    city_state_zip: '',
    tin: '',
  })
  const [signature, setSignature] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem('staff_session_token')
    } catch {
      saved = null
    }
    if (!saved) {
      router.replace('/staff/claim-shifts-login')
      return
    }
    setToken(saved)
    fetch('/api/staff/w9', { headers: { 'x-staff-token': saved } })
      .then(async res => {
        if (!res.ok) {
          router.replace('/staff/claim-shifts-login')
          return
        }
        const data = await res.json()
        setTrained(Boolean(data.trained))
        setSubmitted(Boolean(data.submitted))
      })
      .catch(() => setError('Could not load your W-9 status. Please refresh.'))
      .finally(() => setLoading(false))
  }, [router])

  function set(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!token) return
    if (!signature) {
      setError('Please draw your signature in the box.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/staff/w9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-staff-token': token },
        body: JSON.stringify({ ...form, signature_image: signature }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save the W-9')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the W-9')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">IRS Form W-9</h1>
          <p className="text-sm text-gray-500">Request for Taxpayer Identification Number and Certification</p>
        </div>

        {!trained && !done && (
          <div className="bg-white p-6 shadow-sm text-sm text-gray-700">
            This form opens after you complete all required training modules. Please finish your training first.
          </div>
        )}

        {(submitted || done) && (
          <div className="bg-white p-6 shadow-sm text-sm text-gray-700">
            Thank you. Your W-9 has been received and saved to your records.
          </div>
        )}

        {trained && !submitted && !done && (
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Name (as shown on your tax return) *</label>
              <input className={inputClass} value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Business name (if any)</label>
              <input className={inputClass} value={form.business_name} onChange={e => set('business_name', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Federal tax classification *</label>
              <select className={inputClass} value={form.tax_classification} onChange={e => set('tax_classification', e.target.value)}>
                <option value="">Select one</option>
                {TAX_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Address *</label>
              <input className={inputClass} value={form.address} onChange={e => set('address', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">City, state, ZIP *</label>
              <input className={inputClass} value={form.city_state_zip} onChange={e => set('city_state_zip', e.target.value)} />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">SSN or EIN (9 digits) *</label>
              <input className={inputClass} inputMode="numeric" value={form.tin} onChange={e => set('tin', e.target.value)} placeholder="123-45-6789" />
              <p className="text-xs text-gray-400 mt-1">Stored securely and shown to administrators only in masked form.</p>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed border-t border-gray-200 pt-4">
              Under penalties of perjury, I certify that the number I gave is my correct taxpayer identification number, that I am not subject to backup withholding, and that I am a U.S. person for tax purposes.
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Signature *</label>
              <SignaturePad onChange={setSignature} />
            </div>

            {error && <p className="text-chm-red text-sm bg-red-50 p-3 rounded">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-chm-red text-white py-4 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Submit W-9'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
