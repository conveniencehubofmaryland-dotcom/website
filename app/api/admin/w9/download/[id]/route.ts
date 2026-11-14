import { requireAdmin } from '@/lib/admin-auth'
import { sbFetch } from '@/lib/shift-eligibility'
import { NextRequest, NextResponse } from 'next/server'

const TAX_LABELS: Record<string, string> = {
  individual: 'Individual / sole proprietor',
  single_member_llc: 'Single-member LLC',
  c_corp: 'C Corporation',
  s_corp: 'S Corporation',
  partnership: 'Partnership / multi-member LLC',
  other: 'Other',
}

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  try {
    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const res = await sbFetch(`w9_forms?id=eq.${id}&select=*`)
    const rows = res.ok ? await res.json() : []
    const w9 = Array.isArray(rows) ? rows[0] : null
    if (!w9) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const signedOn = new Date(w9.signed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const maskedTin = `***-**-${String(w9.tin).slice(-4)}`
    const signature = typeof w9.signature_image === 'string' && w9.signature_image.startsWith('data:image/png;base64,')
      ? w9.signature_image
      : ''

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>IRS Form W-9 - ${esc(w9.full_name)}</title>
    <style>
      body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; color: #1A1A1A; }
      h1 { text-align: center; margin-bottom: 4px; }
      h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; }
      .row { margin: 8px 0; }
      .label { font-weight: bold; }
      img { max-width: 320px; border-bottom: 1px solid #000; }
    </style>
  </head>
  <body>
    <h1>IRS Form W-9 (Request for Taxpayer Identification Number)</h1>
    <p style="text-align:center;">Convenience Hub of Maryland, LLC</p>
    <h2>Taxpayer Information</h2>
    <p class="row"><span class="label">Name:</span> ${esc(w9.full_name)}</p>
    <p class="row"><span class="label">Business name:</span> ${esc(w9.business_name || 'N/A')}</p>
    <p class="row"><span class="label">Federal tax classification:</span> ${esc(TAX_LABELS[w9.tax_classification] || w9.tax_classification)}</p>
    <p class="row"><span class="label">Address:</span> ${esc(w9.address)}</p>
    <p class="row"><span class="label">City, state, ZIP:</span> ${esc(w9.city_state_zip)}</p>
    <p class="row"><span class="label">Email:</span> ${esc(w9.staff_email)}</p>
    <h2>Taxpayer Identification Number</h2>
    <p class="row"><span class="label">SSN / EIN:</span> ${esc(maskedTin)} (masked)</p>
    <h2>Certification</h2>
    <p>Under penalties of perjury, the signer certifies that the number shown is a correct taxpayer identification number, that the signer is not subject to backup withholding, and that the signer is a U.S. person for tax purposes.</p>
    <p class="row"><span class="label">Signature:</span></p>
    ${signature ? `<img src="${signature}" alt="Signature" />` : '<p>No signature image</p>'}
    <p class="row"><span class="label">Signed on:</span> ${esc(signedOn)}</p>
    <p style="margin-top:40px;font-size:12px;color:#666;">Record ID: ${esc(w9.id)}</p>
  </body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="W9-${w9.full_name.replace(/[^A-Za-z0-9_-]/g, '_')}.html"`,
      },
    })
  } catch (err) {
    console.error('[w9 download] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
