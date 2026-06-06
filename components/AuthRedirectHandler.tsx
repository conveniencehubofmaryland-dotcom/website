'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthRedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    // Check if there's a recovery token in the URL hash
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const type = params.get('type')

    // If recovery token found, redirect to update-password page
    if (accessToken && type === 'recovery') {
      router.push(`/admin/update-password${window.location.hash}`)
    }
  }, [router])

  return null
}
