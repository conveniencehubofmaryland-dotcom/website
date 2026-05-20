import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbPatchAuth, dbSelectAuth } from '@/lib/db'
import { sendSms } from '@/lib/sms'
import type { JobApplication } from '@/lib/types'


async function getToken(): Promise<string> {
  const c = await cookies()
  return c.get('chm_admin')?.value ?? ''
}

const VALID_STATUSES = ['new', 'reviewed', 'contacted', 'hired', 'rejected']

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

const STATUS_SMS: Partial<Record<string, (name: string) => string>> = {
  reviewed:  name => `Hi ${name}, your application at Convenience Hub of Maryland has been reviewed. We'll be in touch soon. Questions? Call 202-579-2944.`,
  contacted: name => `Hi ${name}, a member of the Convenience Hub of Maryland team will be reaching out to you shortly. Questions? Call 202-579-2944.`,
  hired:     name => `Hi ${name}, congratulations! Convenience Hub of Maryland would like to move forward with your application. Expect a call or email from us soon. Questions? Call 202-579-2944.`,
  rejected:  name => `Hi ${name}, thank you for applying to Convenience Hub of Maryland. After careful review, we have decided to move forward with other candidates. We appreciate your interest.`,
}

const STATUS_EMAIL: Partial<Record<string, (name: string) => { subject: string; html: string }>> = {
  reviewed: name => ({
    subject: 'Your Application Has Been Reviewed — Convenience Hub of Maryland',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#E8192C;padding:24px 32px"><h1 style="color:#fff;font-size:20px;margin:0">Application Update</h1></div>
      <div style="padding:32px;background:#fff;border:1px solid #eee">
        <p style="font-size:15px;color:#222">Hi ${name},</p>
        <p style="color:#444;line-height:1.6">Your application at <strong>Convenience Hub of Maryland</strong> has been reviewed. We'll be in touch with you soon.</p>
        <p style="color:#444;line-height:1.6">Questions? Call or text us at <a href="tel:2025792944" style="color:#E8192C">202-579-2944</a>.</p>
        <p style="color:#888;font-size:12px;margin-top:24px">Convenience Hub of Maryland · conveniencehubofmaryland.com</p>
      </div></div>`,
  }),
  contacted: name => ({
    subject: 'We\'re Reaching Out — Convenience Hub of Maryland',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#E8192C;padding:24px 32px"><h1 style="color:#fff;font-size:20px;margin:0">Application Update</h1></div>
      <div style="padding:32px;background:#fff;border:1px solid #eee">
        <p style="font-size:15px;color:#222">Hi ${name},</p>
        <p style="color:#444;line-height:1.6">A member of the <strong>Convenience Hub of Maryland</strong> team will be reaching out to you shortly regarding your application.</p>
        <p style="color:#444;line-height:1.6">Questions? Call or text us at <a href="tel:2025792944" style="color:#E8192C">202-579-2944</a>.</p>
        <p style="color:#888;font-size:12px;margin-top:24px">Convenience Hub of Maryland · conveniencehubofmaryland.com</p>
      </div></div>`,
  }),
  hired: name => ({
    subject: 'Congratulations! — Convenience Hub of Maryland',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#E8192C;padding:24px 32px"><h1 style="color:#fff;font-size:20px;margin:0">Great News!</h1></div>
      <div style="padding:32px;background:#fff;border:1px solid #eee">
        <p style="font-size:15px;color:#222">Hi ${name},</p>
        <p style="color:#444;line-height:1.6">Congratulations! <strong>Convenience Hub of Maryland</strong> would like to move forward with your application. Please expect a call or email from us with next steps.</p>
        <p style="color:#444;line-height:1.6">Questions? Call or text us at <a href="tel:2025792944" style="color:#E8192C">202-579-2944</a>.</p>
        <p style="color:#888;font-size:12px;margin-top:24px">Convenience Hub of Maryland · conveniencehubofmaryland.com</p>
      </div></div>`,
  }),
  rejected: name => ({
    subject: 'Your Application — Convenience Hub of Maryland',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <div style="background:#E8192C;padding:24px 32px"><h1 style="color:#fff;font-size:20px;margin:0">Application Update</h1></div>
      <div style="padding:32px;background:#fff;border:1px solid #eee">
        <p style="font-size:15px;color:#222">Hi ${name},</p>
        <p style="color:#444;line-height:1.6">Thank you for applying to <strong>Convenience Hub of Maryland</strong>. After careful review, we have decided to move forward with other candidates at this time.</p>
        <p style="color:#444;line-height:1.6">We appreciate your interest and wish you the best in your search.</p>
        <p style="color:#888;font-size:12px;margin-top:24px">Convenience Hub of Maryland · conveniencehubofmaryland.com</p>
      </div></div>`,
  }),
}

async function sendStatusEmail(to: string, name: string, status: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || !to) return
  const emailFn = STATUS_EMAIL[status]
  if (!emailFn) return
  const { subject, html } = emailFn(name)
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'CHM Careers <support@conveniencehubofmaryland.com>',
        to:   [to],
        subject,
        html,
      }),
    })
    if (!res.ok) console.error('[careers email]', await res.text())
  } catch (e) {
    console.error('[careers email]', e)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await getToken()
  if (!t) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const rows = await dbSelectAuth<JobApplication>('job_applications', t, { id: `eq.${id}` })
  const app = rows[0]
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await dbPatchAuth('job_applications', id, { status }, t)
  if (error) return NextResponse.json({ error }, { status: 500 })

  const firstName = app.name.split(' ')[0]
  const smsFn = STATUS_SMS[status]

  await Promise.all([
    smsFn && app.phone
      ? sendSms(normalizePhone(app.phone), smsFn(firstName)).catch(e => console.error('[careers sms]', e))
      : Promise.resolve(),
    app.email
      ? sendStatusEmail(app.email, firstName, status)
      : Promise.resolve(),
  ])

  return NextResponse.json({ success: true })
}
