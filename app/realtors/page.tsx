'use client'

import { useEffect, useState } from 'react'

type Code = { id: string; code: string; buyer_name: string; buyer_email: string; buyer_phone: string | null; status: string; expires_at: string; used_at: string | null; created_at: string }

function codeStatus(c: Code) {
  if (c.status === 'used') return 'Used'
  if (c.status === 'revoked') return 'Cancelled'
  if (new Date(c.expires_at).getTime() <= Date.now()) return 'Expired'
  return 'Active'
}

const input = 'w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red bg-white'
const label = 'block text-xs uppercase tracking-widest text-gray-500 mb-2'
const btn = 'bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60'

export default function RealtorsPage() {
  const [loaded, setLoaded] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [realtorName, setRealtorName] = useState('')
  const [codes, setCodes] = useState<Code[]>([])
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
    setCodes(data.codes || [])
    setLoaded(true)
  }

  useEffect(() => { loadCodes() }, [])

  // Sign the partner out after 30 minutes with no activity on the page.
  // While they are active, check in with the server every 5 minutes to keep the session alive.
  useEffect(() => {
    if (!signedIn) return
    const IDLE_MS = 30 * 60 * 1000
    const PING_MS = 5 * 60 * 1000
    let lastPing = Date.now()
    let timer: ReturnType<typeof setTimeout>
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    const reset = () => {
      clearTimeout(timer)
      if (Date.now() - lastPing > PING_MS) {
        lastPing = Date.now()
        fetch('/api/realtor/referrals').catch(() => {})
      }
      timer = setTimeout(async () => {
        await fetch('/api/realtor/logout', { method: 'POST' }).catch(() => {})
        setSignedIn(false); setCodes([]); setLastCode(''); setCodeSent(false)
        setMsg('You were signed out after 30 minutes of inactivity. Please sign in again.')
      }, IDLE_MS)
    }
    events.forEach(e => window.addEventListener(e, reset))
    reset()
    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [signedIn])

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
    setSignedIn(false); setCodes([]); setLastCode(''); setMsg('')
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

            <div>
              <p className="font-serif text-2xl text-chm-black mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Your referred clients</p>
              {codes.length === 0 ? (
                <p className="text-sm text-gray-400">No referrals yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-xs uppercase tracking-widest text-gray-500 border-b"><th className="py-2">Code</th><th>Buyer</th><th>Contact</th><th>Created</th><th>Expires</th><th>Status</th></tr></thead>
                    <tbody>
                      {codes.map(c => (
                        <tr key={c.id} className="border-b border-gray-100 align-top">
                          <td className="py-3 font-mono">{c.code}</td>
                          <td>{c.buyer_name}</td>
                          <td className="text-xs">{c.buyer_email}{c.buyer_phone ? <><br />{c.buyer_phone}</> : null}</td>
                          <td>{new Date(c.created_at).toLocaleDateString()}</td>
                          <td>{new Date(c.expires_at).toLocaleDateString()}</td>
                          <td>{codeStatus(c)}{c.status === 'used' && c.used_at ? <><br /><span className="text-xs text-gray-500">{new Date(c.used_at).toLocaleDateString()}</span></> : null}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
