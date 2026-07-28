'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/staff/login/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('staff_session_token', data.session_token)
        localStorage.setItem('staff_email', email)
        router.push('/staff/available-shifts')
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid code')
      }
    } catch (err) {
      setError('Error verifying code')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">Verify Code</h1>
          <p className="text-sm text-gray-500">Enter the 6-digit code sent to {email}</p>
        </div>

        <div className="bg-white p-8 shadow-sm rounded">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="w-full border border-gray-200 px-4 py-3 text-sm text-center tracking-widest font-mono focus:outline-none focus:border-chm-red text-2xl"
                placeholder="000000"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>

          <Link
            href="/staff/claim-shifts-login"
            className="block text-center text-chm-red hover:underline text-sm mt-6"
          >
            Back to email entry
          </Link>

          <p className="text-xs text-gray-400 text-center mt-6">
            Didn&apos;t get the code? Check spam folder or call 202-579-2944
          </p>
        </div>
      </div>
    </div>
  )
}
