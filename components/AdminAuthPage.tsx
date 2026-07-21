'use client'

import { useState } from 'react'
import AdminLoginForm from '@/components/AdminLoginForm'
import AdminForgotPasswordForm from '@/components/AdminForgotPasswordForm'

export default function AdminAuthPage() {
  const [mode, setMode] = useState<'login' | 'forgot'>('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-chm-black to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="font-serif text-3xl text-chm-black text-center mb-8">CHM Admin</h1>

        {mode === 'login' ? (
          <>
            <AdminLoginForm />
            <button
              onClick={() => setMode('forgot')}
              className="w-full mt-4 text-sm text-chm-black hover:underline font-semibold"
            >
              Forgot your password?
            </button>
          </>
        ) : (
          <>
            <AdminForgotPasswordForm />
            <button
              onClick={() => setMode('login')}
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
