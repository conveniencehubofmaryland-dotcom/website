import { NextRequest, NextResponse } from 'next/server'
import { sendSms } from '@/lib/sms'

// Receives inbound SMS on the Twilio number and forwards to the owner
export async function POST(req: NextRequest) {
  const body = await req.formData()
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
