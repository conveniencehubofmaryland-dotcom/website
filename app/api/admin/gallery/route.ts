import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const title = formData.get('title') as string
  const service_category = formData.get('service_category') as string
  const beforeFile = formData.get('before_image') as File
  const afterFile = formData.get('after_image') as File

  if (!title || !service_category || !beforeFile || !afterFile) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    const timestamp = Date.now()
    const beforePath = `${service_category}/${timestamp}-before-${beforeFile.name}`
    const afterPath = `${service_category}/${timestamp}-after-${afterFile.name}`

    const beforeUpload = await fetch(
      `${SUPABASE_URL}/storage/v1/object/gallery-images/${beforePath}`,
      {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': beforeFile.type,
        },
        body: beforeFile,
      }
    )
    if (!beforeUpload.ok) {
      console.error('[gallery] before upload failed:', await beforeUpload.text())
      return NextResponse.json({ error: 'Failed to upload before image' }, { status: 500 })
    }

    const afterUpload = await fetch(
      `${SUPABASE_URL}/storage/v1/object/gallery-images/${afterPath}`,
      {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': afterFile.type,
        },
        body: afterFile,
      }
    )
    if (!afterUpload.ok) {
      console.error('[gallery] after upload failed:', await afterUpload.text())
      return NextResponse.json({ error: 'Failed to upload after image' }, { status: 500 })
    }

    const before_image_url = `${SUPABASE_URL}/storage/v1/object/public/gallery-images/${beforePath}`
    const after_image_url = `${SUPABASE_URL}/storage/v1/object/public/gallery-images/${afterPath}`

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/gallery_items`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ title, service_category, before_image_url, after_image_url }),
    })

    if (!insertRes.ok) {
      console.error('[gallery] insert failed:', await insertRes.text())
      return NextResponse.json({ error: 'Failed to save gallery item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[gallery] Error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(`${SUPABASE_URL}/rest/v1/gallery_items?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
  return NextResponse.json({ success: true })
}
