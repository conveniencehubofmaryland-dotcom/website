import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'
import type { Product } from '@/lib/types'
import ProductEditForm from '@/components/ProductEditForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === 'new'
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  let product: Product | null = null
  if (!isNew) {
    const rows = await dbSelectAuth<Product>('products', token, { id: `eq.${id}` })
    product = rows[0] ?? null
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/products" className="text-xs text-gray-400 hover:text-chm-red transition-colors uppercase tracking-widest">
          ← Products
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="font-serif text-2xl text-chm-black">
          {isNew ? 'New Product' : (product?.title ?? id)}
        </h1>
      </div>

      {!isNew && !product ? (
        <p className="text-chm-red text-sm">Product not found.</p>
      ) : (
        <ProductEditForm product={product} isNew={isNew} />
      )}
    </div>
  )
}
