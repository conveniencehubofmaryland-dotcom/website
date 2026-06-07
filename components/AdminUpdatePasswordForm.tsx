'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminUpdatePasswordForm() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [status, setStatus] = useState<'loading' | 'idle' | 'submitting' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  // Extract token from URL on mount
  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')

    if (accessToken) {
      setToken(accessToken)
      setStatus('idle')
    } else {
      setStatus('error')
      setErrorMsg('Invalid or missing reset link. Please request a new one.')
    }
  }, [])

  function validatePasswords() {
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return false
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!validatePasswords()) {
      return
    }

    setStatus('submitting')

    try {
      const res = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update password')
      }

      // Success - redirect to login
      setTimeout(() => {
        router.push('/admin/login')
      }, 1500)
      
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update password.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-100 p-10 w-full max-w-sm">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'error' && !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-100 p-10 w-full max-w-sm">
          <h1 className="font-serif text-3xl text-chm-black mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Invalid Link
          </h1>
          <p className="text-chm-red text-sm mb-6">{errorMsg}</p>
          <a href="/admin/forgot-password" className="block w-full text-center bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
            Request New Link
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 p-10 w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-chm-red font-semibold mb-2">Admin</p>
        <h1 className="font-serif text-3xl text-chm-black mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
          Set New Password
        </h1>

        {status === 'submitting' && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
            <p className="text-blue-800 text-sm">Updating your password...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 p-4 rounded mb-6">
            <p className="text-chm-red text-sm">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">New Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 pr-10 text-sm focus:outline-none focus:border-chm-red transition-colors"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-5.838 1.924l-1.455-1.631zm6.364 12.63l1.414-1.414A3.957 3.957 0 0113 13a4 4 0 00-4-4c-.95 0-1.858.266-2.636.732l1.414 1.414A2.957 2.957 0 0110 11a3 3 0 003-3c0-.364-.074-.71-.202-1.031zM10 7a3 3 0 00-3 3v1l3-3v-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 pr-10 text-sm focus:outline-none focus:border-chm-red transition-colors"
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-5.838 1.924l-1.455-1.631zm6.364 12.63l1.414-1.414A3.957 3.957 0 0113 13a4 4 0 00-4-4c-.95 0-1.858.266-2.636.732l1.414 1.414A2.957 2.957 0 0110 11a3 3 0 003-3c0-.364-.074-.71-.202-1.031zM10 7a3 3 0 00-3 3v1l3-3v-1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {status === 'submitting' ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
