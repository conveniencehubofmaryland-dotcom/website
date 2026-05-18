'use client'
import { useEffect } from 'react'

export default function TawkChat() {
  useEffect(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://embed.tawk.to/6a0a9e423fce491c365fc4d7/1josnkd9f'
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  return null
}
