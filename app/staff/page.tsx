'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import SignaturePad from 'signature_pad'

export default function OrientationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicantId = searchParams.get('id')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [signatureName, setSignatureName] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signaturePadRef = useRef<SignaturePad | null>(null)

  if (!applicantId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-700">Invalid access. Please start from the beginning.</p>
          </div>
        </div>
      </div>
    )
  }

  const initializeSignaturePad = () => {
    if (canvasRef.current && !signaturePadRef.current) {
      const canvas = canvasRef.current
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      canvas.getContext('2d')?.scale(window.devicePixelRatio, window.devicePixelRatio)
      
      signaturePadRef.current = new SignaturePad(canvas, {
        penColor: '#c41e3a',
        minDistance: 2,
      })
    }
  }

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
    }
  }

  const handleSignatureSubmit = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      setError('Please provide a signature.')
      return
    }

    if (!signatureName.trim()) {
      setError('Please enter your name as typed signature.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const signatureData = signaturePadRef.current.toDataURL('image/png')

      const res = await fetch('/api/welcome-center/orientation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantId,
          full_name: fullName,
          email,
          signature: signatureData,
          signature_name: signatureName,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save signature')
      }

      // Redirect to thank you page
      router.push('/welcome-center/thank-you')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('[orientation] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Information
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-8">
              <div className="w-12 h-px bg-chm-red mb-6" />
              <h1 className="font-serif text-3xl text-chm-black mb-2">Orientation Acknowledgment</h1>
              <p className="text-gray-600">Step 1 of 2: Verify Your Information</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={() => {
                  if (!fullName.trim() || !email.trim()) {
                    setError('Please fill in all fields.')
                    return
                  }
                  setError('')
                  initializeSignaturePad()
                  setStep(2)
                }}
                className="w-full bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Continue to Signature
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Signature
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-8">
            <div className="w-12 h-px bg-chm-red mb-6" />
            <h1 className="font-serif text-3xl text-chm-black mb-2">Sign the Document</h1>
            <p className="text-gray-600">Step 2 of 2: Provide Your Signature and Typed Name</p>
          </div>

          <div className="space-y-6">
            {/* Orientation Document Preview */}
            <div className="bg-cream p-6 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
              <h2 className="font-bold text-sm mb-4">ORIENTATION DOCUMENT & MEMORANDUM OF UNDERSTANDING</h2>
              <p className="text-xs text-gray-700 leading-relaxed mb-4">
                By signing this document, I acknowledge that I have read, understood, and agree to comply with all terms outlined in this Orientation Document and Memorandum of Understanding.
              </p>
              <ul className="text-xs text-gray-700 space-y-2 mb-4">
                <li>✓ I have received and reviewed the complete orientation document</li>
                <li>✓ I understand the non-solicitation policy and $30,000 liquidated damages clause</li>
                <li>✓ I understand the confidentiality requirements</li>
                <li>✓ I understand the transportation requirements for shift scheduling</li>
                <li>✓ I agree to comply with all CHM policies and procedures</li>
              </ul>
              <p className="text-xs text-gray-500">
                <strong>By signing below, I agree to all terms listed above.</strong>
              </p>
            </div>

            {/* Signature Pad */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Your Signature *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 cursor-crosshair"
                  onMouseEnter={initializeSignaturePad}
                />
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="text-xs text-chm-red hover:underline mt-2"
              >
                Clear Signature
              </button>
            </div>

            {/* Typed Signature Name */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Sign Your Full Name (Typed) *
              </label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                placeholder="Your full name as it appears in documents"
              />
              <p className="text-xs text-gray-400 mt-1">This will appear below your signature image.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-3 font-semibold text-xs uppercase tracking-widest hover:border-chm-red transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSignatureSubmit}
                disabled={loading}
                className="flex-1 bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Accept & Sign'}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              By signing, you acknowledge that you have read and agree to all terms in the orientation document.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StaffPage() {
  const router = useRouter()
  const [staffName, setStaffName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        let applicantId = typeof window !== 'undefined' ? localStorage.getItem('applicant_id') : null
        
        if (!applicantId) {
          const cookies = document.cookie.split(';')
          const applCookie = cookies.find(c => c.trim().startsWith('applicant_id='))
          applicantId = applCookie ? applCookie.split('=')[1] : null
        }

        if (!applicantId) {
          router.push('/welcome-center')
          return
        }

        const res = await fetch(`/api/staff/welcome/check?applicant_id=${applicantId}`)
        if (!res.ok) {
          router.push('/welcome-center')
          return
        }

        const data = await res.json()
        setStaffName(data.staffName || 'Staff Member')
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/welcome-center')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-2">Welcome</p>
          <h1 className="font-serif text-4xl md:text-5xl text-chm-black">Hello, {staffName}</h1>
          <div className="w-8 h-px bg-chm-red mt-4" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 hover:bg-blue-100 transition-colors">
          <Link href="/staff/how-it-works" className="block">
            <p className="font-serif text-xl text-chm-black mb-2">New to CHM? Start Here</p>
            <p className="text-sm text-gray-700">Learn how our platform works in 5 steps &mdash; onboarding, training, shifts, certifications, and support.</p>
          </Link>
        </div>

        <div className="space-y-6">
          <Link href="/staff/welcome" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-chm-red transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Onboarding</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Complete your profile, review CHM&apos;s orientation, and gain access to training modules.</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </Link>

          <Link href="/staff/training-modules" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-chm-red transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Training Modules</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Complete required training, take the quiz, and earn your CHM certification.</p>
              </div>
              <span className="text-2xl">📚</span>
            </div>
          </Link>

          <Link href="/staff/available-shifts" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-chm-red transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Available Shifts</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Browse and claim shifts that work for your schedule.</p>
              </div>
              <span className="text-2xl">📅</span>
            </div>
          </Link>

          <Link href="/staff/support" className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-chm-red transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Support</h2>
                <p className="text-gray-600 text-sm leading-relaxed">Need help? Contact our HR team for assistance with any questions.</p>
              </div>
              <span className="text-2xl">💬</span>
            </div>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Questions? Visit the <Link href="/staff/how-it-works" className="text-chm-red hover:underline">How It Works</Link> page or submit a support ticket.
          </p>
        </div>
      </div>
    </div>
  )
}
