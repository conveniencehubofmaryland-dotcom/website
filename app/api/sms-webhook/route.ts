import { NextRequest, NextResponse } from 'next/server'
import { sendSms } from '@/lib/sms'

const WEBHOOK_PATH = '/api/sms-webhook'
// Twilio signs the exact URL it calls. Accept either spelling of the site address.
const CANDIDATE_URLS = [
  `https://conveniencehubofmaryland.com${WEBHOOK_PATH}`,
  `https://www.conveniencehubofmaryland.com${WEBHOOK_PATH}`,
]

// Checks the X-Twilio-Signature header (HMAC-SHA1 of URL + sorted form fields, keyed by the auth token).
async function isFromTwilio(signature: string, params: [string, string][]): Promise<boolean> {
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!token || !signature) return false
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(token),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const sorted = [...params].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const fields = sorted.map(([k, v]) => k + v).join('')
  for (const url of CANDIDATE_URLS) {
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(url + fields))
    const expected = btoa(String.fromCharCode(...new Uint8Array(sig)))
    if (expected === signature) return true
  }
  return false
}

// Receives inbound SMS on the Twilio number and forwards to the owner
export async function POST(req: NextRequest) {
  const body = await req.formData()
  const params: [string, string][] = []
  body.forEach((value, key) => {
    if (typeof value === 'string') params.push([key, value])
  })

  const valid = await isFromTwilio(req.headers.get('x-twilio-signature') ?? '', params)
  if (!valid) {
    console.error('[sms-webhook] rejected request with missing or invalid Twilio signature')
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from = body.get('From') as string
  const text = body.get('Body') as string

  if (from && text) {
    await sendSms(
      '+12025792944',
      `SMS from ${from}: ${text}`
    )
  }

  // Return empty TwiML response (no auto-reply)
  return new NextResponse('<Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}
