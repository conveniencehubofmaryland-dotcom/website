'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { CLOVER_MERCHANT_ID, CLOVER_PUBLIC_TOKEN, CLOVER_SDK_URL, saveCloverCharge } from '@/lib/clover'

type Props = {
  kind: 'deposit' | 'full'
  amount: number
  category: string
  selections: Record<string, unknown>
  contact: { name: string; email: string; phone: string }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function CloverCardForm({ kind, amount, category, selections, contact }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ids = {
    number: `cc-number-${uid}`,
    date: `cc-date-${uid}`,
    cvv: `cc-cvv-${uid}`,
    postal: `cc-postal-${uid}`,
  }
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const cloverRef = useRef<any>(null)

  useEffect(() => {
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
  }, [ids.number, ids.date, ids.cvv, ids.postal])

  async function pay() {
    setError('')
    if (!cloverRef.current) {
      setError('The card form is still loading. Please wait a moment and try again.')
      return
    }
    setBusy(true)
    try {
      const result = await cloverRef.current.createToken()
      if (result.errors) {
        setError(Object.values(result.errors).join(' '))
        return
      }
      const res = await fetch('/api/payments/clover-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: result.token,
          kind,
          category,
          selections,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Payment could not be completed.')
      }
      saveCloverCharge(data.chargeId, Number(data.amount))
      setDone(`Payment of $${Number(data.amount).toFixed(2)} received. Reference: ${data.chargeId}. A receipt is on its way to your email.`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment could not be completed.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return <p className="text-sm text-green-700 font-semibold py-4">{done}</p>
  }

  const fieldClass = 'h-10 border border-gray-300 bg-white px-3 py-2 rounded'

  return (
    <div className="text-left space-y-3">
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Card number</label>
        <div id={ids.number} className={fieldClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Expiry</label>
          <div id={ids.date} className={fieldClass} />
        </div>
        <div className="col-span-1">
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">CVV</label>
          <div id={ids.cvv} className={fieldClass} />
        </div>
        <div className="col-span-1">
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">ZIP</label>
          <div id={ids.postal} className={fieldClass} />
        </div>
      </div>

      {error && <p className="text-sm text-chm-red">{error}</p>}

      <button
        type="button"
        onClick={pay}
        disabled={!ready || busy}
        className="w-full bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {busy ? 'Processing…' : `Pay $${amount.toFixed(2)} Securely`}
      </button>
    </div>
  )
}
