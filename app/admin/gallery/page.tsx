import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import GalleryManager from '@/components/GalleryManager'

type GalleryItem = {
  id: string
  service_category: string
  title: string
  before_image_url: string
  after_image_url: string
  sort_order: number
  active: boolean
  created_at: string
}

export default async function AdminGalleryPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  const items = await dbSelectAuth<GalleryItem>('gallery_items', token, {
    select: '*',
    order: 'service_category.asc,sort_order.asc',
  })

  return (
    <div>
      <h1 className="font-serif text-3xl text-chm-black mb-6">Gallery</h1>
      <GalleryManager initialItems={items} />
    </div>
  )
}
