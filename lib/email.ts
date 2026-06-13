import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendAdminEmail(subject: string, message: string) {
  if (!resend) {
    console.error('Missing RESEND_API_KEY; email not sent')
    return
  }
  try {
    const res = await resend.emails.send({
      from: 'team@conveniencehubofmaryland.com',
      to: process.env.ADMIN_EMAIL || 'conveniencehubofmaryland@gmail.com',
      subject,
      html: `<p>${message}</p>`,
    })
    console.log('Admin email sent:', res)
    return res
  } catch (error) {
    console.error('Failed to send admin email:', error)
    throw error
  }
}

export async function sendUserEmail(to: string, subject: string, message: string) {
  if (!resend) {
    console.error('Missing RESEND_API_KEY; email not sent')
    return
  }
  try {
    const res = await resend.emails.send({
      from: 'team@conveniencehubofmaryland.com',
      to,
      subject,
      html: `<p>${message}</p>`,
    })
    console.log('User email sent:', res)
    return res
  } catch (error) {
    console.error('Failed to send user email:', error)
    throw error
  }
}
