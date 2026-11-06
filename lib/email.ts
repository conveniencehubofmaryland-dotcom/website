import { Resend } from 'resend'
import {
  buildPaymentConfirmationHtml,
  paymentConfirmationSubject,
} from '@/lib/payment-confirmation'

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

// Payment confirmation: sent after full payment is confirmed.
// Sends the full HTML template as-is (not wrapped in <p>).
export async function sendPaymentConfirmationEmail(
  to: string,
  name: string,
  serviceTitle: string,
  amountPaid: number,
) {
  if (!resend) {
    console.error('Missing RESEND_API_KEY; email not sent')
    return
  }
  try {
    const res = await resend.emails.send({
      from: 'team@conveniencehubofmaryland.com',
      to,
      subject: paymentConfirmationSubject(serviceTitle),
      html: buildPaymentConfirmationHtml({ name, serviceTitle, amountPaid }),
    })
    console.log('Payment confirmation email sent:', res)
    return res
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error)
    throw error
  }
}
