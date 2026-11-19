import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dbSelectAuth } from '@/lib/db'
import type { Product } from '@/lib/types'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const STATUS_LABEL: Record<string, string> = { coming_soon: 'Coming Soon', out_of_stock: 'Out of Stock', available: 'Available' }

export default async function AdminProductViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!UUID.test(id)) notFound()
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const rows = await dbSelectAuth<Product>('products', token, { id: `eq.${id}`, select: '*' })
  const p = rows[0]
  if (!p) notFound()

  const photos = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : []
  const left = (p.stock_qty ?? 0) - (p.sold_qty ?? 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/products" className="text-xs uppercase tracking-widest text-gray-500 hover:text-chm-black">← All products</Link>
        <Link href={`/admin/products/${p.id}`} className="text-xs uppercase tracking-widest text-chm-red hover:underline underline-offset-4">Edit this product</Link>
      </div>

      <div className="mb-4 inline-block px-3 py-1 text-xs uppercase tracking-widest bg-amber-50 text-amber-800">
        Admin preview. Customers see this only when status is Available and stock is left.
      </div>

      <div className="grid md:grid-cols-2 gap-10 max-w-5xl">
        <div>
          {photos[0] ? (
            <img src={photos[0]} alt={p.title} className="w-full aspect-square object-cover bg-gray-100" />
          ) : (
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No photo</div>
          )}
          {photos.length > 1 && (
            <div className="flex gap-2 mt-3">
              {photos.slice(1).map((src, i) => (
                <img key={i} src={src} alt="" className="w-16 h-16 object-cover bg-gray-100" />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-chm-red font-semibold">{p.category}</p>
          <h1 className="font-serif text-3xl text-chm-black mt-2">{p.title}</h1>
          <p className="text-2xl font-semibold text-chm-black mt-4">{p.price != null ? `$${Number(p.price).toFixed(2)}` : 'Price not set'}</p>
          {p.weight_lb != null && <p className="text-sm text-gray-500 mt-1">Weight: {Number(p.weight_lb)} lb</p>}
          {p.description && <p className="text-gray-600 mt-6 whitespace-pre-line leading-relaxed">{p.description}</p>}

          <div className="mt-8 border-t border-gray-200 pt-6 text-sm space-y-2">
            <p><span className="text-gray-500">Status:</span> <span className="font-semibold">{STATUS_LABEL[p.status] ?? p.status}</span></p>
            <p><span className="text-gray-500">Received:</span> {p.stock_qty ?? 0} · <span className="text-gray-500">Sold:</span> {p.sold_qty ?? 0} · <span className="text-gray-500">Balance:</span> <span className="font-semibold">{left}</span></p>
            <p className="font-mono text-xs text-gray-400">SKU {p.sku}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
