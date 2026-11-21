import { requireAdmin } from '@/lib/admin-auth'
import { sbFetch } from '@/lib/shift-eligibility'
import { emailMembersNewsletter } from '@/lib/member-newsletter'
import { NextRequest, NextResponse } from 'next/server'

const AUDIENCES = ['clients', 'staff', 'members']

// Admin: list all newsletters, create one, or delete one.
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const res = await sbFetch('newsletters?select=id,audience,title,body,published,created_at&order=created_at.desc')
  if (!res.ok) return NextResponse.json({ error: 'Could not load newsletters' }, { status: 500 })
  return NextResponse.json(await res.json())
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const { audience, title, body, published } = await req.json().catch(() => ({}))
  if (!AUDIENCES.includes(audience) || !String(title || '').trim() || !String(body || '').trim()) {
    return NextResponse.json({ error: 'Choose an audience and enter a title and message.' }, { status: 400 })
  }
  const res = await sbFetch('newsletters', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      audience,
      title: String(title).trim(),
      body: String(body).trim(),
      published: published !== false,
    }),
  })
  if (!res.ok) return NextResponse.json({ error: 'Could not save the newsletter' }, { status: 500 })
  const [row] = await res.json()
  // Members newsletters are emailed to every active member when published.
  let emailed = 0
  if (row?.audience === 'members' && row.published) {
    emailed = await emailMembersNewsletter(row.title, row.body)
  }
  return NextResponse.json({ ...row, emailed })
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied
  const id = req.nextUrl.searchParams.get('id') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const res = await sbFetch(`newsletters?id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } })
  if (!res.ok) return NextResponse.json({ error: 'Could not delete' }, { status: 500 })
  return NextResponse.json({ success: true })
}
