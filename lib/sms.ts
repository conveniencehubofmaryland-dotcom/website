export async function sendSms(to: string, body: string): Promise<void> {
  const sid    = process.env.TWILIO_ACCOUNT_SID
  const key    = process.env.TWILIO_API_KEY
  const secret = process.env.TWILIO_API_SECRET
  const from   = process.env.TWILIO_FROM_NUMBER
  if (!sid || !key || !secret || !from) {
    console.error('[sms] missing env vars', { sid: !!sid, key: !!key, secret: !!secret, from: !!from })
    return
  }
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${key}:${secret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    })
    if (!res.ok) console.error('[sms] failed:', await res.text())
  } catch (e) {
    console.error('[sms] error:', e)
  }
}
