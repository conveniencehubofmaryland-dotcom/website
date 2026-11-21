'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MemberLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/member/login/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not send the code.')
        return
      }
      setMessage(data.message || 'A sign-in code has been emailed to you.')
      setStep('code')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/member/login/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Could not sign you in.')
        return
      }
      router.push('/member')
      router.refresh()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const inputCls = 'w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-chm-red'

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-chm-red font-semibold">Members</p>
      <h1 className="font-serif text-3xl text-chm-black mt-2">Member sign in</h1>
      <p className="text-sm text-gray-500 mt-3">
        Use the email you joined with. We will send you a 6-digit code. No password needed.
      </p>

      {step === 'email' ? (
        <form onSubmit={sendCode} className="mt-8 space-y-4">
          <label className="block text-xs uppercase tracking-widest text-gray-500">
            Email
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={`${inputCls} mt-2`} placeholder="you@example.com" />
          </label>
          <button type="submit" disabled={busy} className="w-full bg-chm-red text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50">
            {busy ? 'Sending…' : 'Email me a code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 space-y-4">
          {message && <p className="text-sm text-green-700">{message}</p>}
          <label className="block text-xs uppercase tracking-widest text-gray-500">
            6-digit code
            <input inputMode="numeric" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} className={`${inputCls} mt-2 tracking-[0.5em] text-center text-lg`} />
          </label>
          <button type="submit" disabled={busy || code.length !== 6} className="w-full bg-chm-red text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-red-700 disabled:opacity-50">
            {busy ? 'Checking…' : 'Sign in'}
          </button>
          <button type="button" onClick={() => { setStep('email'); setCode(''); setError('') }} className="w-full text-xs text-gray-500 hover:text-chm-red">
            Use a different email
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      <p className="text-xs text-gray-400 mt-10">Not a member yet? Call 202-579-2944 to join.</p>
    </div>
  )
}
