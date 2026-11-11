import { NextRequest, NextResponse } from 'next/server'
import { svcSelect, svcPatch, sha256Hex, randomSixDigits, sendEmail } from '@/lib/realtor'

// Always answers the same way, so it can't be used to find out who is registered.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  if (email) {
    const rows = await svcSelect<{ id: string }>('realtors', { email: `eq.${email}`, approved: 'eq.true', select: 'id', limit: '1' })
    if (rows[0]) {
      const code = randomSixDigits()
      await svcPatch('realtors', { id: `eq.${rows[0].id}` }, {
        login_code_hash: await sha256Hex(code),
        login_code_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })
      await sendEmail({
        from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
        to: [email],
        subject: 'Your CHM realtor sign-in code',
        html: `<p>Your sign-in code is <strong style="font-size:20px">${code}</strong>.</p><p>It expires in 10 minutes. If you did not ask for this, you can ignore this email.</p>`,
      })
    }
  }
  return NextResponse.json({ ok: true, message: 'If you are an approved partner, a code has been emailed to you.' })
}
