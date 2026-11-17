import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PRIVATE_TYPES = ['government_id', 'social_security_card']

// Admin only: opens an identity document through a link that expires in 5 minutes.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { id } = await params
  const { data: row, error } = await supabase
    .from('staff_documents')
    .select('document_url, document_type')
    .eq('id', id)
    .single()

  if (error || !row || !PRIVATE_TYPES.includes(String(row.document_type)) || !row.document_url) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/sign/applicant-private/${row.document_url}`,
    {
      method: 'POST',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 300 }),
    }
  )
  const data = (await res.json().catch(() => ({}))) as { signedURL?: string }
  if (!res.ok || !data.signedURL) {
    return NextResponse.json({ error: 'Could not open the document' }, { status: 500 })
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1${data.signedURL}`)
}
