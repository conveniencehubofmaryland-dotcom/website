import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

// Keeps only letters, numbers, dots and dashes so file names never break image links.
function safeName(name: string): string {
  return name.replace(/[^A-Za-z0-9.-]/g, '-').replace(/-+/g, '-').slice(-80)
}

const CATEGORIES = ['cleaning', 'laundry', 'culinary', 'care', 'commercial']

export async function POST(req: NextRequest) {
  const token = req.cookies.get('chm_admin')?.value ?? ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const denied = await requireAdmin(req)
  if (denied) return denied

  const formData = await req.formData()
  const title = String(formData.get('title') ?? '').trim()
  const service_category = String(formData.get('service_category') ?? '')
  const image = formData.get('image')

  if (!title || !CATEGORIES.includes(service_category) || !(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: 'Please add a title, a category and one photo.' }, { status: 400 })
  }
  if (!image.type.startsWith('image/')) {
    return NextResponse.json({ error: 'The file must be a picture (JPG, PNG or similar).' }, { status: 400 })
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    const path = `${service_category}/${Date.now()}-${safeName(image.name)}`

    const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/gallery-images/${path}`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        ...(SERVICE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}),
        'Content-Type': image.type,
      },
      body: image,
    })
    if (!upload.ok) {
      console.error('[gallery] upload failed:', await upload.text())
      return NextResponse.json({ error: 'Failed to upload the photo.' }, { status: 500 })
    }

    const image_url = `${SUPABASE_URL}/storage/v1/object/public/gallery-images/${path}`

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/gallery_items`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        ...(SERVICE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ title, service_category, image_url }),
    })

    if (!insertRes.ok) {
      console.error('[gallery] insert failed:', await insertRes.text())
      return NextResponse.json({ error: 'Failed to save the gallery item.' }, { status: 500 })
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
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(`${SUPABASE_URL}/rest/v1/gallery_items?id=eq.${id}`, {
    method: 'DELETE',
    headers: { apikey: SERVICE_KEY, ...(SERVICE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SERVICE_KEY}` } : {}) },
  })

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 })
  return NextResponse.json({ success: true })
}
