import { NextRequest, NextResponse } from 'next/server'


// One-time admin account creation.
// Disabled automatically once an account exists.
export async function POST(req: NextRequest) {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const serviceKey      = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  // Refuse once any account exists, so a stranger cannot create an admin.
  try {
    const svcHeaders: Record<string, string> = { apikey: serviceKey }
    if (serviceKey.startsWith('eyJ')) svcHeaders.Authorization = `Bearer ${serviceKey}`
    const check = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1`, { headers: svcHeaders })
    const list = await check.json()
    const users = Array.isArray(list?.users) ? list.users : []
    if (!check.ok || users.length > 0) {
      return NextResponse.json(
        { error: 'Admin setup is closed. An admin account already exists.' },
        { status: 403 }
      )
    }
  } catch {
    return NextResponse.json({ error: 'Could not verify setup status. Try again later.' }, { status: 500 })
  }

  const { email, password } = await req.json()
  if (!email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: supabaseAnonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password: password.trim() }),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data.msg ?? data.message ?? 'Signup failed. The account may already exist.' },
      { status: 400 }
    )
  }

  // If email confirmation is required, data.session will be null
  const needsConfirmation = !data.session
  return NextResponse.json({
    success: true,
    needsConfirmation,
    message: needsConfirmation
      ? 'Account created. Check your email to confirm before logging in.'
      : 'Account created. You can now log in.',
  })
}
