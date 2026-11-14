'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SignaturePad from '@/components/SignaturePad'

type OfferDetails = {
  id: string
  applicant_id: string
  position: string
  salary_annual: number
  start_date: string
  benefits_summary: string | null
  letter_html?: string
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
  const [signatureImage, setSignatureImage] = useState('')

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
      setError('Please type your full name.')
      return
    }
    if (!signatureImage) {
      setError('Please draw your signature in the box.')
      return
    }
    setSigning(true)
    setError('')

    try {
      const res = await fetch('/api/offer/sign/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, offer_id: offer?.id, signature_name: signatureName.trim(), signature_image: signatureImage }),
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

        <div className="bg-white p-4 md:p-6 shadow-sm mb-8">
          {offer.letter_html ? (
            <iframe
              title="Offer letter"
              srcDoc={offer.letter_html}
              className="w-full border-0"
              style={{ height: '75vh', minHeight: '520px' }}
            />
          ) : (
            <p className="text-sm text-gray-500">Loading your offer letter…</p>
          )}
          <p className="text-xs text-gray-500 mt-4">Scroll through the full letter above, then sign below.</p>
        </div>

        {error && (
          <p className="text-chm-red text-sm bg-red-50 p-3 rounded mb-6">{error}</p>
        )}

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Full Name *</label>
          <input
            type="text"
            value={signatureName}
            onChange={e => setSignatureName(e.target.value)}
            placeholder="Your full name"
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-black"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Signature *</label>
          <SignaturePad onChange={setSignatureImage} />
          <p className="text-xs text-gray-400 mt-1">Draw your signature with your finger or mouse. By signing, you acknowledge this offer letter.</p>
        </div>

        <button
          onClick={handleSign}
          disabled={signing || !signatureName.trim() || !signatureImage}
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
