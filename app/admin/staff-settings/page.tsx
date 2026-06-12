'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StaffSettings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchPassword()
  }, [])

  const fetchPassword = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const res = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.staff_portal_password`, {
      headers: { apikey: supabaseKey as string, Authorization: `Bearer ${supabaseKey as string}` },
    })
    const data = await res.json()
    setCurrentPassword(data[0]?.value || '')
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      setMessage('Password cannot be empty')
      return
    }
    setLoading(true)
    const res = await fetch('/api/admin/update-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword: newPassword.trim() }),
    })
    if (res.ok) {
      setMessage('✅ Password updated successfully!')
      setCurrentPassword(newPassword)
      setNewPassword('')
    } else {
      setMessage('❌ Failed to update password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-red-600 hover:underline mb-6 inline-block">
          ← Back to Admin
        </Link>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-8 text-red-600">Staff Portal Settings</h1>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Staff Access Link:</p>
            <p className="text-lg font-mono font-semibold text-blue-600">conveniencehubofmaryland.com/staff/available-shifts</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Current Password</label>
              <p className="text-lg font-mono bg-gray-100 p-3 rounded-lg border border-gray-300">
                {currentPassword}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">New Password</label>
              <input
                type="text"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>

            {message && (
              <p className={`text-center font-semibold ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>

          <hr className="my-8" />

          <div>
            <h2 className="text-xl font-bold mb-4">How It Works</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Staff visit the link above</li>
              <li>✓ Enter password: <span...>&quot;{currentPassword}&quot;</span>
              <li>✓ View available shifts</li>
              <li>✓ Click "Pick Up Shift" to claim</li>
              <li>✓ You see their details in Manage Shifts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
