'use client'
import { useState } from 'react'

export default function AdminForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to send reset email')
      }

      setStatus('success')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send reset email.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 p-10 w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-chm-red font-semibold mb-2">Admin</p>
        <h1 className="font-serif text-3xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 mb-8">Enter your email to receive a password reset link.</p>

        {status === 'success' ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <p className="text-green-800 text-sm font-medium">✓ Check your email</p>
              <p className="text-green-700 text-xs mt-1">We&apos;ve sent a password reset link to <strong>{email}</strong></p>
            </div>
            <p className="text-xs text-gray-600">The link expires in 1 hour. If you don&apos;t see it, check your spam folder.</p>
            <a href="/admin/login" className="block w-full text-center bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
              Back to Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            {status === 'error' && (
              <p className="text-chm-red text-sm">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {status === 'submitting' ? 'Sending…' : 'Send Reset Link'}
            </button>

            <p className="text-center text-xs text-gray-600">
              Remember your password? <a href="/admin/login" className="text-chm-red hover:underline">Sign in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
