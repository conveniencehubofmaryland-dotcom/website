'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [mode, setMode] = useState<'code' | 'id'>('code')
  const [staffId, setStaffId] = useState('')
  const router = useRouter()

  // Sign in with email + staff ID number (no emailed code).
  const handleStaffIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/staff/login/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, staffId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Sign in failed')
        return
      }
      try {
        localStorage.setItem('staff_session_token', data.session_token)
        localStorage.setItem('staff_email', email)
      } catch {
        // Storage may be blocked; the portal will ask to sign in again.
      }
      router.push('/staff')
    } catch {
      setError('Error signing in')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/staff/login/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubmitted(true)
        setTimeout(() => {
          router.push(`/staff/claim-shifts-login/verify?email=${encodeURIComponent(email)}`)
        }, 1500)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to send code')
      }
    } catch (err) {
      setError('Error sending code')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 shadow-sm rounded text-center">
            <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
            <h1 className="font-serif text-2xl text-chm-black mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-6">We&apos;ve sent a 6-digit verification code to:</p>
            <p className="font-semibold text-gray-900 mb-6">{email}</p>
            <p className="text-sm text-gray-500">Redirecting to verification page...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">Sign In</h1>
          <p className="text-sm text-gray-500">Enter your email to claim shifts</p>
        </div>

        <div className="bg-white p-8 shadow-sm rounded">
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setMode('code'); setError('') }}
              className={`py-2 text-xs uppercase tracking-widest font-semibold border ${mode === 'code' ? 'border-chm-red bg-red-50 text-chm-black' : 'border-gray-200 text-gray-500'}`}
            >
              Email code
            </button>
            <button
              type="button"
              onClick={() => { setMode('id'); setError('') }}
              className={`py-2 text-xs uppercase tracking-widest font-semibold border ${mode === 'id' ? 'border-chm-red bg-red-50 text-chm-black' : 'border-gray-200 text-gray-500'}`}
            >
              Staff ID number
            </button>
          </div>

          {mode === 'id' && (
            <form onSubmit={handleStaffIdSubmit} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">Staff ID Number</label>
                <input
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  required
                  className="w-full border border-gray-200 px-4 py-3 text-sm uppercase focus:outline-none focus:border-chm-red"
                  placeholder="As printed on your badge"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'code' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              type="submit"
              disabled={loading}
              className="w-full bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
          )}

          <p className="text-xs text-gray-400 text-center mt-6">
            Need help? Call 202-579-2944 (Mon–Sat 7 AM–11 PM, Sun 9 AM–9 PM)
          </p>
        </div>
      </div>
    </div>
  )
}
