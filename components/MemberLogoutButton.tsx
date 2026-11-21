'use client'
import { useRouter } from 'next/navigation'

export default function MemberLogoutButton() {
  const router = useRouter()

  async function signOut() {
    await fetch('/api/member/logout', { method: 'POST' }).catch(() => {})
    router.push('/member/login')
    router.refresh()
  }

  return (
    <button type="button" onClick={signOut} className="border border-gray-300 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-600 hover:border-chm-black hover:text-chm-black">
      Sign out
    </button>
  )
}
