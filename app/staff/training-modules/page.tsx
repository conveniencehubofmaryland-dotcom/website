'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { TrainingModule } from '@/lib/types'

const SESSION_KEY = 'training_session'

type TrainingSession = {
  token: string
  name: string
  email: string
  phone: string
}

const POSITIONS = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary / Chef',
  'Nanny / Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]

function readSession(): TrainingSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as TrainingSession) : null
  } catch {
    return null
  }
}

function saveSession(session: TrainingSession | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Private browsing may block storage; the page still works for this visit.
  }
}

export default function TrainingModulesPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [appliedPosition, setAppliedPosition] = useState('')
  const [otherPositionsUnlocked, setOtherPositionsUnlocked] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState('')
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Restore a verified session for this browser tab.
  useEffect(() => {
    const saved = readSession()
    if (saved) {
      setSession(saved)
      setEmail(saved.email)
    }
  }, [])

  // Once verified, the applicant's applied position is the only one open until its first module is passed.
  useEffect(() => {
    if (!session) return
    fetch('/api/staff/training-access', { headers: { 'x-training-token': session.token } })
      .then(async res => {
        if (!res.ok) {
          saveSession(null)
          setSession(null)
          setMessage('Your verification has ended. Please enter your email and a new code.')
          return
        }
        const data = await res.json()
        setAppliedPosition(data.position || '')
        setOtherPositionsUnlocked(!!data.other_positions_unlocked)
        setSelectedPosition(data.position || '')
      })
      .catch(() => setError('We could not load your training. Please try again.'))
  }, [session])

  // Load modules for the chosen position.
  useEffect(() => {
    if (!selectedPosition) {
      setModules([])
      return
    }
    setLoading(true)
    fetch(`/api/training/modules?position=${encodeURIComponent(selectedPosition)}`, {
      headers: session ? { 'x-training-token': session.token } : {},
    })
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch modules')
        setModules((await res.json()) || [])
      })
      .catch(() => setError('Error loading modules'))
      .finally(() => setLoading(false))
  }, [selectedPosition, session])

  async function requestCode() {
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/training/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error || 'Could not send the code. Please try again.')
        return
      }
      setCodeSent(true)
      setMessage('If this email is registered, a 6-digit code was sent to it. Enter it below.')
    } catch {
      setMessage('Could not send the code. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode() {
    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/training/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error || 'That code is not correct.')
        return
      }
      const next: TrainingSession = {
        token: data.training_token,
        name: data.full_name,
        email: email.trim(),
        phone: data.phone,
      }
      saveSession(next)
      setSession(next)
      setCodeSent(false)
      setCode('')
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const positionLocked = (pos: string) => !!session && !otherPositionsUnlocked && pos !== appliedPosition

  // ---- Step 1 and 2: verify the email with the code ----
  if (!session) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-cream py-10 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Training & Certification</p>
            <h1 className="font-serif text-5xl md:text-6xl text-chm-black">Get Certified</h1>
            <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          </div>
        </div>

        <div className="max-w-xl mx-auto px-6 sm:px-8 py-16">
          <div className="bg-gray-50 border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-chm-black mb-2">Verify your email to start training</h2>
            <p className="text-sm text-gray-600 mb-6">Enter the email you applied with. We will send a 6-digit code to it. Your training starts on the position you applied for.</p>

            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={codeSent}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red mb-4"
              placeholder="your@email.com"
            />
            {!codeSent && (
              <button
                onClick={requestCode}
                disabled={busy || !email.includes('@')}
                className="w-full bg-chm-red text-white px-6 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {busy ? 'Sending...' : 'Send Code'}
              </button>
            )}

            {codeSent && (
              <>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black tracking-widest focus:outline-none focus:border-chm-red mb-4"
                  placeholder="123456"
                />
                <button
                  onClick={verifyCode}
                  disabled={busy || code.length !== 6}
                  className="w-full bg-chm-red text-white px-6 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  {busy ? 'Checking...' : 'Verify and Start Training'}
                </button>
                <button onClick={requestCode} disabled={busy} className="block w-full text-center text-xs text-gray-500 hover:underline mt-4">
                  Send a new code
                </button>
              </>
            )}

            {message && <p className="text-sm text-gray-700 mt-4">{message}</p>}
          </div>
        </div>
      </div>
    )
  }

  // ---- Step 3: training for the applied position ----
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Training & Certification</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black">Get Certified</h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-500 text-sm">Signed in as {session.name} ({session.email})</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
        {error && <p className="text-chm-red text-sm mb-6">{error}</p>}

        <div className="mb-12">
          <h2 className="text-lg font-semibold text-chm-black mb-4">Your Positions</h2>
          {!appliedPosition && <p className="text-sm text-gray-600">Your applied position is not set yet. Please contact HR.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {POSITIONS.map(pos => (
              <button
                key={pos}
                disabled={positionLocked(pos)}
                onClick={() => setSelectedPosition(pos)}
                className={`border-2 px-4 py-3 text-sm text-left transition-all ${
                  positionLocked(pos)
                    ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : selectedPosition === pos
                      ? 'border-chm-red bg-red-50 text-chm-black font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-chm-red'
                }`}
              >
                {pos}
                {pos === appliedPosition && <span className="block text-xs mt-1">Applied position</span>}
                {positionLocked(pos) && <span className="block text-xs mt-1">Locked: pass the first module of {appliedPosition} to unlock</span>}
              </button>
            ))}
          </div>
        </div>

        {selectedPosition && (
          <div>
            <h2 className="text-lg font-semibold text-chm-black mb-6">Training Modules</h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading modules...</p>
            ) : modules.length === 0 ? (
              <p className="text-gray-400 text-sm">No training modules available for this position yet.</p>
            ) : (
              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module.id} className="border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-chm-black text-lg mb-2">{module.title}</h3>
                        <p className="text-gray-500 text-sm mb-4">{module.description}</p>
                        <p className="text-xs text-gray-400">Position: {module.position}</p>
                      </div>
                      <Link
                        href={`/staff/training-modules/${module.id}?name=${encodeURIComponent(session.name)}&email=${encodeURIComponent(session.email)}&phone=${encodeURIComponent(session.phone)}`}
                        className="px-6 py-2 text-sm font-semibold uppercase tracking-widest whitespace-nowrap bg-chm-red text-white hover:bg-red-700"
                      >
                        Start Module
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => {
            saveSession(null)
            setSession(null)
            setCodeSent(false)
            setCode('')
            setMessage('')
          }}
          className="mt-12 text-xs text-gray-500 hover:underline"
        >
          Not you? Verify a different email
        </button>
      </div>
    </div>
  )
}
