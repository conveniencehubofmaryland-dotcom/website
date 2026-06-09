'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'

type Props = {
  product: Product | null
  isNew: boolean
}

export default function ProductEditForm({ product, isNew }: Props) {
  const router = useRouter()

  const [fields, setFields] = useState({
    sku:         product?.sku         ?? '',
    title:       product?.title       ?? '',
    category:    product?.category    ?? 'Cleaning & Eco-Friendly',
    description: product?.description ?? '',
    price:       product?.price       ?? '',
    image_url:   product?.image_url   ?? '',
    active:      product?.active      ?? false,
    sort_order:  product?.sort_order  ?? 0,
  })

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  function setField(k: string, v: string | number | boolean) {
    setFields(f => ({ ...f, [k]: v }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${product!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          price: fields.price ? Number(fields.price) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete '${fields.title}'? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${product!.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-chm-red transition-colors'

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-8">
      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">
          Product Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isNew && (
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">SKU *</label>
              <input required value={fields.sku} onChange={e => setField('sku', e.target.value)}
                className={inputCls} placeholder="CHM-C01" />
            </div>
          )}

          <div className={isNew ? '' : 'sm:col-span-2'}>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Title *</label>
            <input required value={fields.title} onChange={e => setField('title', e.target.value)}
              className={inputCls} placeholder="Eco All-Purpose Spray" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Category *</label>
            <select value={fields.category} onChange={e => setField('category', e.target.value)}
              className={inputCls}>
              <option>Cleaning & Eco-Friendly</option>
              <option>Laundry & Fabric Care</option>
              <option>Home Convenience</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Price</label>
            <input type="number" step="0.01" value={fields.price} onChange={e => setField('price', e.target.value)}
              className={inputCls} placeholder="19.99" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Description</label>
            <textarea rows={3} value={fields.description} onChange={e => setField('description', e.target.value)}
              className={`${inputCls} resize-none`} placeholder="Product details and benefits..." />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
            <input value={fields.image_url} onChange={e => setField('image_url', e.target.value)}
              className={inputCls} placeholder="https://example.com/image.jpg" />
            {fields.image_url && (
              <img src={fields.image_url} alt="preview" className="mt-2 h-20 object-cover" />
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Sort Order</label>
            <input type="number" value={fields.sort_order} onChange={e => setField('sort_order', Number(e.target.value))}
              className={inputCls} />
          </div>

          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="active" checked={fields.active} onChange={e => setField('active', e.target.checked)}
              className="w-4 h-4 accent-chm-red" />
            <label htmlFor="active" className="text-sm text-chm-black">Available (uncheck for Coming Soon)</label>
          </div>
        </div>
      </div>

      {error && <p className="text-chm-red text-sm">{error}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-chm-red text-white px-8 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/products')}
            className="border border-gray-200 text-gray-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-chm-black hover:text-chm-black transition-colors">
            Cancel
          </button>
        </div>
        {!isNew && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="text-xs text-gray-400 hover:text-chm-red transition-colors disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete Product'}
          </button>
        )}
      </div>
    </form>
  )
}
