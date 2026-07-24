'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OrientationForm({ position, applicantId }: { position: string; applicantId: string }) {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [signature, setSignature] = useState('')
  const [understood, setUnderstood] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    if (!fullName.trim() || !email.trim() || !signature.trim()) {
      setErrorMsg('Please fill in all required fields.')
      setLoading(false)
      return
    }
    if (!understood || !agreedToTerms) {
      setErrorMsg('Please acknowledge that you have read and understand all terms.')
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/welcome-center/orientation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          position: position,
          full_name: fullName,
          email: email,
          signature: signature,
        }),
      })
      const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : {}
      if (!res.ok) throw new Error(data.error ?? 'Failed to save acknowledgment')
      const encodedPosition = encodeURIComponent(position)
      router.push(`/welcome-center/thank-you?position=${encodedPosition}&applicant_id=${applicantId}`)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 shadow-sm space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name *</label>
        <input
          required
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
          placeholder="Your full name"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address *</label>
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
          placeholder="your.email@example.com"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Signature (Type your full name) *</label>
        <input
          required
          type="text"
          value={signature}
          onChange={e => setSignature(e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors font-script text-lg"
          placeholder="Type your full name as your signature"
        />
        <p className="text-xs text-gray-400 mt-1">By typing your name, you are electronically signing this acknowledgment.</p>
      </div>
      <div className="space-y-3 border-t border-gray-200 pt-6">
        <label className="flex items-start gap-3">
          <input
            required
            type="checkbox"
            checked={understood}
            onChange={e => setUnderstood(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">I have read and fully understand the Convenience Hub of Maryland Orientation Document, including all policies, procedures, and expectations outlined above.</span>
        </label>
        <label className="flex items-start gap-3">
          <input
            required
            type="checkbox"
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">I have read and fully understand the Memorandum of Understanding (MOU), including the non-solicitation agreement, confidentiality requirements, and liquidated damages clause. I agree to comply with all terms.</span>
        </label>
      </div>
      {errorMsg && (
        <p className="text-chm-red text-sm bg-red-50 p-3 rounded">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-chm-red text-white py-4 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
      >
        {loading ? 'Processing…' : 'Accept & Continue'}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Questions? Call us at 202-579-2944 (Mon–Sat, 9 AM–9 PM)
      </p>
    </form>
  )
}
