import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbSelectAuth, dbPatchAuth, dbDeleteAuth, dbInsertAuth } from '@/lib/db'
import type { Member } from '@/lib/types'

async function getToken() {
  const cookieStore = await cookies()
  return cookieStore.get('chm_admin')?.value ?? ''
}

export async function GET() {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const members = await dbSelectAuth<Member>('members', token, { select: '*', order: 'created_at.desc' })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { name, phone, email, state, address, preferred_services, service_frequency, recurring } = body
  if (!name?.trim() || !phone?.trim() || !email?.trim() || !state) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  const { error } = await dbInsertAuth('members', {
    name: name.trim(), phone: phone.trim(), email: email.trim(), state,
    address: address?.trim() || null,
    preferred_services: Array.isArray(preferred_services) && preferred_services.length ? preferred_services : null,
    service_frequency: service_frequency || null,
    recurring: !!recurring,
    active: true,
  }, token)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, ...patch } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await dbPatchAuth('members', id, patch, token)
  if (error) return NextResponse.json({ error }, { status: 500 })

  // When activating a member, notify them
  if (patch.active === true) {
    const rows = await dbSelectAuth<Member>('members', token, { 'id': `eq.${id}`, select: '*' })
    const m = rows[0]
    if (m) {
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey && m.email) {
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
            reply_to: ['conveniencehubofmaryland@gmail.com'],
            to: [m.email],
            subject: 'Your CHM Membership is Now Active',
            html: `
              <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
                <div style="background:#E8192C;padding:24px 32px">
                  <h1 style="color:#fff;font-size:20px;margin:0">Membership Activated</h1>
                </div>
                <div style="padding:32px;background:#fff;border:1px solid #eee">
                  <p style="font-size:15px;color:#333">Hi ${m.name},</p>
                  <p style="font-size:14px;color:#555;line-height:1.6">
                    Your Convenience Hub of Maryland membership has been approved and is now active.
                    You now have full access to all member benefits.
                  </p>
                  <table style="border-collapse:collapse;font-size:14px;width:100%;margin:20px 0">
                    <tr style="border-bottom:1px solid #f0f0f0">
                      <td style="padding:10px 0;color:#888;width:160px">Priority Booking</td>
                      <td style="color:#222;font-weight:600">First access to available time slots</td>
                    </tr>
                    <tr style="border-bottom:1px solid #f0f0f0">
                      <td style="padding:10px 0;color:#888">Recurring Discount</td>
                      <td style="color:#222;font-weight:600">2% off all recurring services</td>
                    </tr>
                    <tr>
                      <td style="padding:10px 0;color:#888">Exclusive Deals</td>
                      <td style="color:#222;font-weight:600">Member-only weekly promotions</td>
                    </tr>
                  </table>
                  <p style="font-size:14px;color:#555">
                    Book your first service at <a href="https://www.conveniencehubofmaryland.com/book" style="color:#E8192C">conveniencehubofmaryland.com/book</a>
                    or call us at <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.
                  </p>
                  <p style="font-size:12px;color:#aaa;margin-top:32px">Convenience Hub of Maryland &nbsp;·&nbsp; Maryland · Virginia · D.C.</p>
                </div>
              </div>
            `,
          }),
        }).catch(() => {})
      }

      // WhatsApp to member's phone if on WhatsApp — skip, no member apikey.
      // Notify owner via WhatsApp that activation was done
      const waKey1 = process.env.CALLMEBOT_API_KEY
      const waPhone1 = process.env.CALLMEBOT_PHONE
      const waKey2 = process.env.CALLMEBOT_API_KEY_2
      const waPhone2 = process.env.CALLMEBOT_PHONE_2
      const waMsg = encodeURIComponent(`MEMBER ACTIVATED\nName: ${m.name}\nPhone: ${m.phone}\nEmail: ${m.email}`)
      const waSend = (p: string, k: string) =>
        fetch(`https://api.callmebot.com/whatsapp.php?phone=${p}&text=${waMsg}&apikey=${k}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }).catch(() => {})
      if (waKey1 && waPhone1) waSend(waPhone1, waKey1)
      if (waKey2 && waPhone2) waSend(waPhone2, waKey2)
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const token = await getToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await dbDeleteAuth('members', id, token)
  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
