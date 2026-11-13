'use client'

import { useEffect, useState } from 'react'

const input = 'w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red bg-white'
const label = 'block text-xs uppercase tracking-widest text-gray-500 mb-2'
const btn = 'bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60'

export default function RealtorsPage() {
  const [loaded, setLoaded] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [realtorName, setRealtorName] = useState('')
  const [tab, setTab] = useState<'register' | 'signin'>('signin')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const [reg, setReg] = useState({ name: '', email: '', phone: '', brokerage: '' })
  const [email, setEmail] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [buyer, setBuyer] = useState({ buyerName: '', buyerEmail: '', buyerPhone: '' })
  const [lastCode, setLastCode] = useState('')

  async function loadCodes() {
    const res = await fetch('/api/realtor/referrals')
    // Only show the partner area when the server confirms a signed-in realtor.
    if (!res.ok) { setSignedIn(false); setLoaded(true); return }
    const data = await res.json()
    setSignedIn(true)
    setRealtorName(data.realtor?.name || '')
    setLoaded(true)
  }

  useEffect(() => { loadCodes() }, [])

  async function post(url: string, body: unknown) {
    setBusy(true); setErr(''); setMsg('')
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      return data
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
      return null
    } finally {
      setBusy(false)
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault()
    const data = await post('/api/realtor/register', reg)
    if (data) {
      setMsg('Thanks! We will review your request and email you when your partner account is approved.')
      setReg({ name: '', email: '', phone: '', brokerage: '' })
    }
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault()
    const data = await post('/api/realtor/request-code', { email })
    if (data) { setCodeSent(true); setMsg(data.message) }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault()
    const data = await post('/api/realtor/verify-code', { email, code: otp })
    if (data) { setOtp(''); setCodeSent(false); setMsg(''); await loadCodes() }
  }

  async function createCode(e: React.FormEvent) {
    e.preventDefault()
    const data = await post('/api/realtor/referrals', buyer)
    if (data) {
      setLastCode(data.code)
      setBuyer({ buyerName: '', buyerEmail: '', buyerPhone: '' })
      setMsg(`Code created and emailed to the buyer. It is valid for one month and works once.`)
      await loadCodes()
    }
  }

  async function logout() {
    await fetch('/api/realtor/logout', { method: 'POST' })
    setSignedIn(false); setLastCode(''); setMsg('')
  }

  if (!loaded) return <div className="max-w-3xl mx-auto px-6 py-24 text-gray-400 text-sm">Loading…</div>

  return (
    <div className="bg-white">
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Partners</p>
          <h1 className="font-serif text-4xl md:text-5xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>Realtor Partners</h1>
          <div className="w-12 h-px bg-chm-red mt-6" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        {msg && <p className="text-sm text-green-700 bg-green-50 border border-green-100 px-4 py-3">{msg}</p>}
        {err && <p className="text-sm text-chm-red bg-red-50 border border-red-100 px-4 py-3">{err}</p>}

        {!signedIn && (
          <div className="space-y-8">
            <div className="flex gap-6 border-b border-gray-200">
              <button onClick={() => { setTab('signin'); setMsg(''); setErr('') }} className={`pb-3 text-sm font-semibold uppercase tracking-widest ${tab === 'signin' ? 'text-chm-red border-b-2 border-chm-red' : 'text-gray-400'}`}>Sign in</button>
              <button onClick={() => { setTab('register'); setMsg(''); setErr('') }} className={`pb-3 text-sm font-semibold uppercase tracking-widest ${tab === 'register' ? 'text-chm-red border-b-2 border-chm-red' : 'text-gray-400'}`}>Become a partner</button>
            </div>

            {tab === 'register' && (
              <form onSubmit={register} className="space-y-5">
                <p className="text-sm text-gray-500">Partners get a 15% discount code for each homebuyer they refer. Partner accounts are approved by our team.</p>
                <div><label className={label}>Full name *</label><input required className={input} value={reg.name} onChange={e => setReg({ ...reg, name: e.target.value })} /></div>
                <div><label className={label}>Brokerage</label><input className={input} value={reg.brokerage} onChange={e => setReg({ ...reg, brokerage: e.target.value })} /></div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><label className={label}>Email *</label><input required type="email" className={input} value={reg.email} onChange={e => setReg({ ...reg, email: e.target.value })} /></div>
                  <div><label className={label}>Phone *</label><input required type="tel" className={input} value={reg.phone} onChange={e => setReg({ ...reg, phone: e.target.value })} /></div>
                </div>
                <button disabled={busy} className={btn}>{busy ? 'Sending…' : 'Request Partner Access'}</button>
              </form>
            )}

            {tab === 'signin' && !codeSent && (
              <form onSubmit={requestCode} className="space-y-5">
                <p className="text-sm text-gray-500">Enter your partner email. We will send a 6-digit sign-in code.</p>
                <div><label className={label}>Partner email</label><input required type="email" className={input} value={email} onChange={e => setEmail(e.target.value)} /></div>
                <button disabled={busy} className={btn}>{busy ? 'Sending…' : 'Email Me a Code'}</button>
              </form>
            )}

            {tab === 'signin' && codeSent && (
              <form onSubmit={verify} className="space-y-5">
                <p className="text-sm text-gray-500">Enter the 6-digit code sent to {email}. It expires in 10 minutes.</p>
                <div><label className={label}>Sign-in code</label><input required inputMode="numeric" maxLength={6} className={input} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} /></div>
                <button disabled={busy} className={btn}>{busy ? 'Checking…' : 'Sign In'}</button>
              </form>
            )}
          </div>
        )}

        {signedIn && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <p className="text-chm-black">Welcome, <strong>{realtorName}</strong></p>
              <button onClick={logout} className="text-xs uppercase tracking-widest text-gray-500 hover:text-chm-red">Sign out</button>
            </div>

            <form onSubmit={createCode} className="space-y-5 border border-gray-200 p-6">
              <p className="font-serif text-2xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>Refer a homebuyer</p>
              <p className="text-sm text-gray-500">We email the buyer a 15% discount code on any service. The code is valid for one month and works once.</p>
              <div className="grid sm:grid-cols-3 gap-5">
                <div><label className={label}>Buyer name *</label><input required className={input} value={buyer.buyerName} onChange={e => setBuyer({ ...buyer, buyerName: e.target.value })} /></div>
                <div><label className={label}>Buyer email *</label><input required type="email" className={input} value={buyer.buyerEmail} onChange={e => setBuyer({ ...buyer, buyerEmail: e.target.value })} /></div>
                <div><label className={label}>Buyer phone</label><input type="tel" className={input} value={buyer.buyerPhone} onChange={e => setBuyer({ ...buyer, buyerPhone: e.target.value })} /></div>
              </div>
              {lastCode && <p className="text-sm">Last code: <strong className="tracking-widest">{lastCode}</strong></p>}
              <button disabled={busy} className={btn}>{busy ? 'Creating…' : 'Create & Email Code'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
