import { NextRequest, NextResponse } from 'next/server'

// Serves a stored training certificate as a web page (storage serves HTML as plain text).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/public/application-documents/certificates/${id}.html`
  )
  if (!res.ok) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  const html = await res.text()
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, max-age=300',
    },
  })
}
