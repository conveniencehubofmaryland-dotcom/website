import { brandEmail, CHM_REPLY_TO } from '@/lib/email-brand'
import { sbFetch } from '@/lib/shift-eligibility'

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Emails a members newsletter to every active member. Returns how many emails were sent.
export async function emailMembersNewsletter(title: string, body: string): Promise<number> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return 0
  const res = await sbFetch(`members?status=eq.active&select=email&limit=5000`)
  if (!res.ok) return 0
  const members = (await res.json()) as { email: string | null }[]
  const emails = [...new Set(members.map(m => (m.email || '').trim()).filter(Boolean))]

  const html = brandEmail(`
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <div style="background:#E8192C;padding:24px 32px">
        <p style="color:#fff;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px">Members Newsletter</p>
        <h1 style="color:#fff;font-size:20px;margin:0">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #eee;font-size:14px;color:#333;line-height:1.7">
        ${escapeHtml(body).replace(/\n/g, '<br>')}
        <p style="margin-top:28px"><a href="https://conveniencehubofmaryland.com/member" style="color:#E8192C">Open your member portal</a></p>
      </div>
    </div>
  `)

  let sent = 0
  // Resend accepts up to 100 emails per batch call.
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100)
    try {
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(
          chunk.map(to => ({
            from: 'Convenience Hub of Maryland <support@conveniencehubofmaryland.com>',
            reply_to: [CHM_REPLY_TO],
            to: [to],
            subject: title,
            html,
          }))
        ),
      })
      if (r.ok) sent += chunk.length
      else console.error('[members-newsletter] batch failed:', await r.text())
    } catch (e) {
      console.error('[members-newsletter] batch error:', e)
    }
  }
  return sent
}
