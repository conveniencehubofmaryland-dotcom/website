import { NextRequest, NextResponse } from 'next/server'
import { getSignedInRealtor, svcSelect, svcInsert, sendEmail, makeReferralCode } from '@/lib/realtor'

export async function GET() {
  const realtor = await getSignedInRealtor()
  if (!realtor) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
  const codes = await svcSelect<Record<string, unknown>>('referral_codes', {
    realtor_id: `eq.${realtor.id}`, select: 'id,code,buyer_name,buyer_email,buyer_phone,status,expires_at,used_at,created_at', order: 'created_at.desc',
  })
  return NextResponse.json({ realtor: { name: realtor.name }, codes })
}

export async function POST(req: NextRequest) {
  const realtor = await getSignedInRealtor()
  if (!realtor) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const buyerName = String(body.buyerName || '').trim()
  const buyerEmail = String(body.buyerEmail || '').trim().toLowerCase()
  const buyerPhone = String(body.buyerPhone || '').trim()
  if (!buyerName || !buyerEmail) {
    return NextResponse.json({ error: 'Enter the buyer\'s name and email.' }, { status: 400 })
  }

  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const code = makeReferralCode()
  const res = await svcInsert('referral_codes', {
    code, realtor_id: realtor.id, buyer_name: buyerName, buyer_email: buyerEmail,
    buyer_phone: buyerPhone || null, status: 'unused', expires_at: expires.toISOString(),
  })
  if (!res.ok) {
    console.error('[referral] insert failed:', res.error)
    return NextResponse.json({ error: 'Could not create the code. Please try again.' }, { status: 500 })
  }

  const firstName = buyerName.split(' ')[0]
  await sendEmail({
    from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
    reply_to: ['conveniencehubofmaryland@gmail.com'],
    to: [buyerEmail],
    subject: 'Your 15% home services discount from Convenience Hub of Maryland',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<h2 style="color:#E8192C">Welcome to your new home, ${firstName}!</h2>
<p>${realtor.name} has arranged a <strong>15% discount</strong> on any Convenience Hub of Maryland service for you.</p>
<p style="font-size:18px">Your code: <strong style="letter-spacing:2px">${code}</strong></p>
<p style="font-size:14px;color:#555">Enter this code on our quote form. It works <strong>once</strong> and is valid until ${expires.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
<p><a href="https://conveniencehubofmaryland.com/book" style="display:inline-block;background:#E8192C;color:#fff;padding:12px 28px;text-decoration:none;font-weight:600">Get Your Quote</a></p>
<p style="font-size:13px;color:#666">Questions? Call or text 202-579-2944.</p>
</div>`,
  })

  return NextResponse.json({ ok: true, code, expires_at: expires.toISOString() })
}
