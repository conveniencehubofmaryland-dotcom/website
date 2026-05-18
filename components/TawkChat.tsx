'use client'
import { useEffect } from 'react'

// Setup: sign up at tawk.to, create a property, then set
// NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID
// in Cloudflare Pages environment variables.
export default function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID
  const widgetId   = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID ?? '1il'

  useEffect(() => {
    if (!propertyId) return

    const script = document.createElement('script')
    script.async = true
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [propertyId, widgetId])

  return null
}
