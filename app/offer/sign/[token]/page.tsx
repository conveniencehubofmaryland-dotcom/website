'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

type OfferDetails = {
  id: string
  applicant_id: string
  position: string
  salary_annual: number
  start_date: string
  benefits_summary: string | null
  applicant_name: string
  applicant_email: string
}

export default function SignOfferPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [offer, setOffer] = useState<OfferDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [signatureName, setSignatureName] = useState('')

  useEffect(() => {
    // Fetch offer details by token
    async function fetchOffer() {
      try {
        const res = await fetch(`/api/offer/sign/verify?token=${token}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Offer not found')
        setOffer(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offer')
      } finally {
        setLoading(false)
      }
    }
    fetchOffer()
  }, [token])

  async function handleSign() {
    if (!signatureName.trim()) {
      setError('Please type your full name as your signature.')
      return
    }
    setSigning(true)
    setError('')

    try {
      const res = await fetch('/api/offer/sign/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, offer_id: offer?.id, signature_name: signatureName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to sign offer')
      setSigned(true)
      setTimeout(() => router.push('/offer/thank-you'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500">Loading offer details...</p>
      </div>
    )
  }

  if (error && !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-4">Offer Not Found</h1>
          <p className="text-gray-600 text-sm">{error}</p>
          <p className="text-xs text-gray-400 mt-6">Contact us at 202-579-2944 for assistance</p>
        </div>
      </div>
    )
  }

  if (!offer) return null

  const startDateFormatted = new Date(offer.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (signed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-4">Offer Accepted!</h1>
          <p className="text-gray-600 text-sm mb-6">Thank you for accepting your offer. A confirmation email has been sent.</p>
          <p className="text-xs text-gray-400">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">Your Offer Letter</h1>
          <p className="text-sm text-gray-500">Please review and accept to confirm your position</p>
        </div>

        <div className="bg-white p-8 shadow-sm mb-8">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Dear {offer.applicant_name},</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                We are pleased to offer you the position of <strong>{offer.position}</strong> at Convenience Hub of Maryland, effective <strong>{startDateFormatted}</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-chm-black mb-3">POSITION DETAILS</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Position:</strong> {offer.position}</li>
                <li><strong>Start Date:</strong> {startDateFormatted}</li>
                <li><strong>Engagement Type:</strong> Independent contractor (IRS Form 1099)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-chm-black mb-3">COMPENSATION</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Pay Schedule:</strong> Paid every Friday for work performed in the prior week</li>
                <li><strong>Pay Structure:</strong> Per the CHM Contractor Compensation Structure, as detailed in your offer letter</li>
                <li><strong>Benefits:</strong> Not eligible for employee benefits (independent contractor)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-chm-black mb-3">TERMS OF EMPLOYMENT</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>This offer is contingent on successful completion of a background check and reference verification</li>
                <li>This is an independent contractor engagement, not employment, and may be ended by either party at any time</li>
                <li>You must complete all required company paperwork before your start date</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-chm-black mb-3">NEXT STEPS</h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li>1. Accept this offer by clicking below</li>
                <li>2. Complete background check authorization</li>
                <li>3. Bring government ID and proof of work authorization on Day 1</li>
                <li>4. Complete required training modules</li>
                <li>5. Claim your first shift when available</li>
              </ol>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-chm-red text-sm bg-red-50 p-3 rounded mb-6">{error}</p>
        )}

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Signature (type your full name) *</label>
          <input
            type="text"
            value={signatureName}
            onChange={e => setSignatureName(e.target.value)}
            placeholder="Type your full name as your signature"
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-black"
          />
        </div>

        <button
          onClick={handleSign}
          disabled={signing || !signatureName.trim()}
          className="w-full bg-chm-red text-white py-4 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60 mb-4"
        >
          {signing ? 'Processing...' : 'Accept & Sign Offer'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Questions? Call 202-579-2944 (Mon–Sat 7 AM–11 PM, Sun 9 AM–9 PM)
        </p>
      </div>
    </div>
  )
}
