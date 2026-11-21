'use client'

import { useEffect, useId } from 'react'
import { CLOVER_MERCHANT_ID, CLOVER_PUBLIC_TOKEN, CLOVER_SDK_URL } from '@/lib/clover'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Card fields for Premium sign-up. The parent calls cloverRef.current.createToken() to get the card token.
export default function PremiumCardFields({ cloverRef }: { cloverRef: { current: any } }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ids = { number: `pcf-number-${uid}`, date: `pcf-date-${uid}`, cvv: `pcf-cvv-${uid}`, postal: `pcf-postal-${uid}` }

  useEffect(() => {
    let cancelled = false
    let script: HTMLScriptElement | null = null
    let clover: any = null

    function init() {
      if (cancelled || !(window as any).Clover) return
      const Clover = (window as any).Clover
      clover = new Clover(CLOVER_PUBLIC_TOKEN, { merchantId: CLOVER_MERCHANT_ID })
      const elements = clover.elements()
      elements.create('CARD_NUMBER').mount(`#${ids.number}`)
      elements.create('CARD_DATE').mount(`#${ids.date}`)
      elements.create('CARD_CVV').mount(`#${ids.cvv}`)
      elements.create('CARD_POSTAL_CODE').mount(`#${ids.postal}`)
      cloverRef.current = clover
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
      if (cloverRef.current === clover) cloverRef.current = null
    }
  }, [cloverRef, ids.number, ids.date, ids.cvv, ids.postal])

  const fieldClass = 'h-10 border border-gray-300 bg-white px-3 py-2 rounded'

  return (
    <div className="space-y-3">
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
    </div>
  )
}
