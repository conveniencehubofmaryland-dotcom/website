import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sbFetch } from '@/lib/shift-eligibility'
import { sendUserEmailHtml } from '@/lib/email'

const SAME_REPLY = { success: true, message: 'If your membership is active, a sign-in code has been emailed to you.' }

// Emails a 6-digit sign-in code to an active member. Always gives the same reply,
// so this cannot be used to find out who is a member.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  try {
    const res = await sbFetch(`members?email=ilike.${encodeURIComponent(email)}&select=id,name,email,status`)
    if (!res.ok) return NextResponse.json({ error: 'Could not send the code. Please try again.' }, { status: 500 })
    const rows = (await res.json()) as { id: string; name: string; email: string; status: string }[]
    const m = rows[0]
    if (!m || m.status !== 'active') return NextResponse.json(SAME_REPLY)

    const code = crypto.randomInt(100000, 999999).toString()
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const save = await sbFetch(`members?id=eq.${m.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ login_code: code, login_code_expires_at: expires, login_code_attempts: 0 }),
    })
    if (!save.ok) return NextResponse.json({ error: 'Could not send the code. Please try again.' }, { status: 500 })

    await sendUserEmailHtml(
      m.email,
      'Your member sign-in code',
      `<p>Hi ${m.name.split(' ')[0]},</p>
       <p>Your sign-in code for the Convenience Hub of Maryland member portal is:</p>
       <p style="font-size:24px;font-weight:bold;letter-spacing:8px;text-align:center;margin:20px 0;">${code}</p>
       <p>This code expires in 10 minutes. If you did not ask for it, ignore this email.</p>`
    )
    return NextResponse.json(SAME_REPLY)
  } catch (err) {
    console.error('[member login] send-code error:', err)
    return NextResponse.json({ error: 'Could not send the code. Please try again.' }, { status: 500 })
  }
}
