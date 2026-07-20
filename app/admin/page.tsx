'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import AdminLoginForm from '@/components/AdminLoginForm'
import AdminForgotPasswordForm from '@/components/AdminForgotPasswordForm'

export default function AdminPage() {
  // ... rest of code
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-chm-black to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="font-serif text-3xl text-chm-black text-center mb-8">CHM Admin</h1>

        {!showForgotPassword ? (
          <>
            <AdminLoginForm />
            <button
              onClick={() => setShowForgotPassword(true)}
              className="w-full mt-4 text-sm text-chm-black hover:underline font-semibold"
            >
              Forgot your password?
            </button>
          </>
        ) : (
          <>
            <AdminForgotPasswordForm />
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full mt-4 text-sm text-chm-black hover:underline font-semibold"
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
