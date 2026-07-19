'use client'
import { useState } from 'react'

export default function AdminLoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Login failed')
      }
      window.location.href = '/admin/appointments'
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Login failed.')
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-chm-red font-semibold mb-2">Admin</p>
      <h1 className="font-serif text-3xl text-chm-black mb-8">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Password</label>
          <div className="relative">
            <input
              required
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-200 px-4 py-3 pr-10 text-sm focus:outline-none focus:border-chm-red transition-colors"
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
        {status === 'error' && <p className="text-chm-red text-sm">{errorMsg}</p>}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-chm-red text-white py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {status === 'submitting' ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
