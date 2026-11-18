// Invoices: created when a Clover payment succeeds, then emailed to the client and copied to admin.
import { sbFetch } from '@/lib/shift-eligibility'
import { brandedEmailHtml } from '@/lib/email-brand'

export type InvoiceLine = { label: string; amount: number }

export type InvoiceRecord = {
  id: string
  invoice_number: string
  charge_id: string
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  service_category: string | null
  line_items: InvoiceLine[]
  total: number
  amount_paid: number
  payment_kind: string
  created_at: string
}

const esc = (v: unknown) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const money = (n: number) => `$${n.toFixed(2)}`

// Saves the invoice. The number (CHM-1001, CHM-1002, ...) is assigned by the database.
export async function createInvoice(input: {
  chargeId: string
  name: string
  email: string
  phone: string
  category: string
  lineItems: InvoiceLine[]
  total: number
  amountPaid: number
  paymentKind: 'deposit' | 'full'
}): Promise<InvoiceRecord> {
  const res = await sbFetch('invoices', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      charge_id: input.chargeId,
      client_name: input.name || null,
      client_email: input.email || null,
      client_phone: input.phone || null,
      service_category: input.category || null,
      line_items: input.lineItems,
      total: input.total,
      amount_paid: input.amountPaid,
      payment_kind: input.paymentKind,
    }),
  })
  const rows = res.ok ? await res.json() : []
  if (!res.ok || !Array.isArray(rows) || rows.length === 0) {
    throw new Error(`Invoice could not be saved (${res.status})`)
  }
  return rows[0] as InvoiceRecord
}

export function invoiceSubject(inv: InvoiceRecord): string {
  return `Invoice ${inv.invoice_number} from Convenience Hub of Maryland`
}

// The branded invoice, used for the client email and the admin copy.
// `extraHtml` adds an optional line (for example, the recurring plan management link).
export function buildInvoiceHtml(inv: InvoiceRecord, extraHtml = ''): string {
  const date = new Date(inv.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const lines = inv.line_items
    .map(l => `<tr><td style="padding:6px 12px 6px 0;border-bottom:1px solid #eee">${esc(l.label)}</td><td style="padding:6px 0;text-align:right;border-bottom:1px solid #eee">${money(l.amount)}</td></tr>`)
    .join('')
  const balance = Math.round((inv.total - inv.amount_paid) * 100) / 100
  const paidLabel = inv.payment_kind === 'deposit' ? 'Deposit paid (30%)' : 'Payment received'

  return brandedEmailHtml(`
<h2 style="color:#E8192C;margin:0 0 4px 0">Invoice ${esc(inv.invoice_number)}</h2>
<p style="margin:0 0 16px 0;color:#555">Issued ${date}</p>
<p style="margin:0 0 4px 0"><strong>Billed to:</strong> ${esc(inv.client_name || 'Client')}</p>
<p style="margin:0 0 16px 0">${esc(inv.client_email || '')}${inv.client_phone ? ` &middot; ${esc(inv.client_phone)}` : ''}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr><th style="text-align:left;padding:6px 0;border-bottom:2px solid #E8192C">Description</th><th style="text-align:right;padding:6px 0;border-bottom:2px solid #E8192C">Amount</th></tr>
  ${lines}
  <tr><td style="padding:8px 12px 4px 0;text-align:right"><strong>Sales tax</strong></td><td style="padding:8px 0 4px 0;text-align:right">None applied</td></tr>
  <tr><td style="padding:4px 12px 4px 0;text-align:right"><strong>Total</strong></td><td style="padding:4px 0;text-align:right"><strong>${money(inv.total)}</strong></td></tr>
  <tr><td style="padding:4px 12px 4px 0;text-align:right">${paidLabel}</td><td style="padding:4px 0;text-align:right;color:#16a34a">${money(inv.amount_paid)}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;text-align:right"><strong>Balance due</strong></td><td style="padding:4px 0;text-align:right"><strong>${money(balance)}</strong></td></tr>
</table>
<p style="font-size:13px;color:#555;margin-top:20px">Card payment reference: ${esc(inv.charge_id)}</p>
${extraHtml}
<p style="font-size:13px;color:#555">Questions about this invoice? Call or text <a href="tel:+12025792944" style="color:#E8192C">202-579-2944</a>.</p>`)
}
