'use client'

export default function AdminLogoutButton() {
  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
    >
      Logout
    </button>
  )
}
