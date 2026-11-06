const SUPPORT_PHONE = '202-579-2944'
const SITE_URL = 'https://conveniencehubofmaryland.com'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function paymentConfirmationSubject(serviceTitle: string): string {
  return `Payment Confirmed — ${serviceTitle}`
}

export function buildPaymentConfirmationHtml(opts: {
  name: string
  serviceTitle: string
  amountPaid: number
}): string {
  const name = escapeHtml(opts.name.trim())
  const serviceTitle = escapeHtml(opts.serviceTitle)
  const amount = opts.amountPaid.toFixed(2)

  return `<h2 style="color:#E8192C">Payment Received, ${name}!</h2>
<p style="font-size:14px;color:#333">Thank you. We have received your payment of <strong>$${amount}</strong> for <strong>${serviceTitle}</strong>. Your slot is secured.</p>

<div style="background:#f8f6f2;padding:16px;margin-top:16px;font-size:13px;color:#333;line-height:1.6">
<p style="margin:0 0 8px 0"><strong>When your service will happen</strong></p>
<p style="margin:0 0 8px 0">Your service is offered within <strong>6 to 72 hours</strong> of confirmed payment. Our team will contact you to confirm the exact date and time.</p>
<p style="margin:0 0 8px 0">Need service sooner? Call our customer service team directly at <strong>${SUPPORT_PHONE}</strong>. We will arrange it with you and confirm whether an earlier time is possible.</p>
<p style="margin:0">Please do not assume an earlier time until we have confirmed it with you.</p>
</div>

<p style="font-size:13px;color:#666;margin-top:16px">Questions? Call or text us at ${SUPPORT_PHONE}.</p>
<p style="font-size:12px;color:#999;margin-top:16px"><a href="${SITE_URL}" style="color:#999">conveniencehubofmaryland.com</a></p>`
}
