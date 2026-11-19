import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { serviceHeaders } from '@/lib/supabase-keys'

const BUCKET = 'gallery-images'
const MAX_BYTES = 10 * 1024 * 1024

// Keeps only letters, numbers, dots and dashes so file names never break image links.
function safeName(name: string): string {
  return name.replace(/[^A-Za-z0-9.-]/g, '-').replace(/-+/g, '-').slice(-80)
}

// Admin: uploads one product photo and returns its public link.
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const formData = await req.formData()
  const image = formData.get('image')
  if (!(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: 'Please choose a photo.' }, { status: 400 })
  }
  if (!image.type.startsWith('image/')) {
    return NextResponse.json({ error: 'The file must be a picture (JPG, PNG or similar).' }, { status: 400 })
  }
  if (image.size > MAX_BYTES) {
    return NextResponse.json({ error: 'The photo is too large. Please use one under 10 MB.' }, { status: 400 })
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!SUPABASE_URL) return NextResponse.json({ error: 'Storage is not configured.' }, { status: 500 })

  const path = `products/${Date.now()}-${safeName(image.name)}`
  const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: serviceHeaders({ 'Content-Type': image.type }),
    body: image,
  })
  if (!upload.ok) {
    console.error('[products] image upload failed:', await upload.text())
    return NextResponse.json({ error: 'Failed to upload the photo.' }, { status: 500 })
  }

  return NextResponse.json({ url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}` })
}
