'use client'
import { useState, useRef, useEffect } from 'react'

const PHONE_DISPLAY = '202-579-2944'
const PHONE_TEL = '+12025792944'
const PHONE_WHATSAPP = '12025792944'
const ADMIN_EMAIL = 'conveniencehubofmaryland@gmail.com'

function buildMailto(label: string) {
  const subject = encodeURIComponent(`Custom Quote Request — ${label}`)
  const body = encodeURIComponent(
    `Hi Convenience Hub of Maryland,\n\nI am interested in a custom quote for: ${label}\n\nPlease find my details below:\n\n- Name: \n- Phone: \n- Location (MD / VA / DC): \n- Preferred schedule or frequency: \n- Property size or special requirements: \n- Best time to reach me: \n\nThank you!`
  )
  return `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`
}

export default function CustomQuoteButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="hover:underline underline-offset-4"
      >
        Custom Quote
      </button>
      {open && (
        <div className="absolute z-10 mt-2 left-0 bg-white border border-gray-200 shadow-lg rounded w-56 py-2">
          <a href={`tel:${PHONE_TEL}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-cream">
            Call {PHONE_DISPLAY}
          </a>
          <a href={`https://wa.me/${PHONE_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-cream">
            WhatsApp
          </a>
          <div className="px-4 py-2 text-sm text-gray-700">
            <a href={buildMailto(label)} className="hover:underline">
              {ADMIN_EMAIL}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
