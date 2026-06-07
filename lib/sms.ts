export async function sendSms(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !from) {
    console.error('[sms] missing env vars', { sid: !!sid, token: !!token, from: !!from })
    return
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    })
    if (!res.ok) console.error('[sms] failed:', await res.text())
  } catch (e) {
    console.error('[sms] error:', e)
  }
}

export async function sendAdminSMS(message: string): Promise<void> {
  const phone1 = process.env.ADMIN_PHONE_1
  const phone2 = process.env.ADMIN_PHONE_2

  if (phone1) await sendSms(phone1, message)
  if (phone2) await sendSms(phone2, message)
}
