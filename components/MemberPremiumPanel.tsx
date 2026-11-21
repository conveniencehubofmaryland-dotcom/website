'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CLOVER_MERCHANT_ID, CLOVER_PUBLIC_TOKEN, CLOVER_SDK_URL } from '@/lib/clover'
import { PREMIUM_PRICE, type PremiumBilling } from '@/lib/membership-tiers'

type Props = {
  tier: 'free' | 'premium'
  billing: PremiumBilling | null
  nextChargeDate: string | null
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// Premium sign-up (card saved, automatic renewal) and cancel, for a signed-in member.
export default function MemberPremiumPanel({ tier, billing, nextChargeDate }: Props) {
  const router = useRouter()
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ids = { number: `pm-number-${uid}`, date: `pm-date-${uid}`, cvv: `pm-cvv-${uid}`, postal: `pm-postal-${uid}` }
  const [choice, setChoice] = useState<PremiumBilling>('monthly')
  const [agree, setAgree] = useState(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const cloverRef = useRef<any>(null)

  useEffect(() => {
    if (tier !== 'free') return
    let cancelled = false
    let script: HTMLScriptElement | null = null

    function init() {
      if (cancelled || !(window as any).Clover || cloverRef.current) return
      const Clover = (window as any).Clover
      const clover = new Clover(CLOVER_PUBLIC_TOKEN, { merchantId: CLOVER_MERCHANT_ID })
      const elements = clover.elements()
      elements.create('CARD_NUMBER').mount(`#${ids.number}`)
      elements.create('CARD_DATE').mount(`#${ids.date}`)
      elements.create('CARD_CVV').mount(`#${ids.cvv}`)
      elements.create('CARD_POSTAL_CODE').mount(`#${ids.postal}`)
      cloverRef.current = clover
      setReady(true)
    }

    if ((window as any).Clover) {
      init()
    } else {
      script = document.querySelector(`script[src="${CLOVER_SDK_URL}"]`) as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.src = CLOVER_SDK_URL
        script.async = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', init)
    }

    return () => {
      cancelled = true
      script?.removeEventListener('load', init)
    }
  }, [tier, ids.number, ids.date, ids.cvv, ids.postal])

  async function joinPremium() {
    setError('')
    if (!cloverRef.current) {
      setError('The card form is still loading. Please wait a moment and try again.')
      return
    }
    if (!agree) {
      setError('Please tick the box to agree to automatic billing.')
      return
    }
    setBusy(true)
    try {
      const result = await cloverRef.current.createToken()
      if (result.errors) {
        setError(Object.values(result.errors).join(' '))
        return
      }
      const res = await fetch('/api/member/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: result.token, billing: choice, consent: agree }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Premium could not be started.')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Premium could not be started.')
    } finally {
      setBusy(false)
    }
  }

  async function cancelPremium() {
    if (!window.confirm('Cancel Premium? You will go back to Free and no more payments will be taken. No refund for the current period.')) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/member/premium/cancel', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not cancel Premium.')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel Premium.')
    } finally {
      setBusy(false)
    }
  }

  if (tier === 'premium') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          Automatic billing: ${PREMIUM_PRICE[billing ?? 'monthly']} each {billing === 'annual' ? 'year' : 'month'}
          {nextChargeDate ? `. Next charge: ${nextChargeDate}.` : '.'}
        </p>
        {error && <p className="text-sm text-chm-red">{error}</p>}
        <button type="button" onClick={cancelPremium} disabled={busy} className="border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-600 hover:border-chm-black hover:text-chm-black disabled:opacity-50">
          {busy ? 'Please wait…' : 'Cancel Premium'}
        </button>
      </div>
    )
  }

  const fieldClass = 'h-10 border border-gray-300 bg-white px-3 py-2 rounded'

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {(['monthly', 'annual'] as PremiumBilling[]).map(b => (
          <label key={b} className={`border p-4 cursor-pointer text-sm ${choice === b ? 'border-chm-red' : 'border-gray-200'}`}>
            <input type="radio" name={`billing-${uid}`} className="mr-2" checked={choice === b} onChange={() => setChoice(b)} />
            <span className="font-semibold text-chm-black">${PREMIUM_PRICE[b]} {b === 'monthly' ? 'a month' : 'a year'}</span>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Card number</label>
        <div id={ids.number} className={fieldClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Expiry</label>
          <div id={ids.date} className={fieldClass} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">CVV</label>
          <div id={ids.cvv} className={fieldClass} />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">ZIP</label>
          <div id={ids.postal} className={fieldClass} />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer text-gray-700 text-xs leading-relaxed">
        <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1" />
        <span>
          I agree that Convenience Hub of Maryland may charge ${PREMIUM_PRICE[choice]} to this card now and then every {choice === 'monthly' ? 'month' : 'year'} until I cancel in my member portal.
        </span>
      </label>

      {error && <p className="text-sm text-chm-red">{error}</p>}

      <button type="button" onClick={joinPremium} disabled={!ready || busy} className="w-full bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
        {busy ? 'Processing…' : `Join Premium · $${PREMIUM_PRICE[choice]} now`}
      </button>
    </div>
  )
}
