import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'
import type { Product } from '@/lib/types'

export default async function AdminProductsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const products = await dbSelectAuth<Product>('products', token, { order: 'sort_order' })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-chm-black">Products</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} in database</p>
        </div>
        <Link href="/admin/products/new"
          className="bg-chm-red text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors">
          + New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No products yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                {['SKU', 'Title', 'Category', 'Price', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="py-3 px-4 font-semibold text-chm-black">{p.title}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm">{p.category}</td>
                  <td className="py-3 px-4 text-gray-500">{p.price ? `$${p.price}` : '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 ${p.active ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {p.active ? 'Available' : 'Coming Soon'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/products/${p.id}`}
                      className="text-xs text-chm-red hover:underline underline-offset-4">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
