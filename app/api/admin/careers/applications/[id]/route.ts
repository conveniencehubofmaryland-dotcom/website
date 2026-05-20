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

const STATUS_MESSAGES: Partial<Record<string, (name: string) => string>> = {
  reviewed:  name => `Hi ${name}, your application at Convenience Hub of Maryland has been reviewed. We'll be in touch soon. Questions? Call 202-579-2944.`,
  contacted: name => `Hi ${name}, a member of the Convenience Hub of Maryland team will be reaching out to you shortly about your application. Questions? Call 202-579-2944.`,
  hired:     name => `Hi ${name}, congratulations! Convenience Hub of Maryland would like to move forward with your application. Expect a call or email from us soon. Questions? Call 202-579-2944.`,
  rejected:  name => `Hi ${name}, thank you for applying to Convenience Hub of Maryland. After careful review, we have decided to move forward with other candidates. We appreciate your interest.`,
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

  const msgFn = STATUS_MESSAGES[status]
  if (msgFn && app.phone) {
    const to = normalizePhone(app.phone)
    const firstName = app.name.split(' ')[0]
    sendSms(to, msgFn(firstName)).catch(e => console.error('[careers sms]', e))
  }

  return NextResponse.json({ success: true })
}
