'use client'
import { useState } from 'react'

export default function AdminLoginForm() {
  const [form, setForm]     = useState({ email: '', password: '' })
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 p-10 w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-chm-red font-semibold mb-2">Admin</p>
        <h1 className="font-serif text-3xl text-chm-black mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
          Sign In
        </h1>

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
            <input
              required
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors"
            />
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
    </div>
  )
}
