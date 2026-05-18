'use client'
import { useState } from 'react'
import Link from 'next/link'


export default function AdminSetupPage() {
  const [email,    setEmail]    = useState('conveniencehubofmaryland@gmail.com')
  const [password, setPassword] = useState('')
  const [status,   setStatus]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message,  setMessage]  = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('done')
      setMessage(data.message)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 p-10 w-full max-w-md">
        <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">One-Time Setup</p>
        <h1 className="font-serif text-3xl text-chm-black mb-6">Create Admin Account</h1>
        <div className="w-10 h-px bg-chm-red mb-8" />

        {status === 'done' ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
            <Link href="/admin/login"
              className="block text-center bg-chm-red text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Password (min 8 characters)</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                minLength={8}
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red transition-colors" />
            </div>
            {status === 'error' && <p className="text-chm-red text-sm">{message}</p>}
            <button type="submit" disabled={status === 'loading'}
              className="w-full bg-chm-red text-white py-3 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
              {status === 'loading' ? 'Creating Account…' : 'Create Account'}
            </button>
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              This page is only for initial setup. After creating your account, use{' '}
              <Link href="/admin/login" className="text-chm-red hover:underline">/admin/login</Link> to sign in.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
