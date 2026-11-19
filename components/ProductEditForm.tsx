'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/types'
import { salePrice } from '@/lib/shop-pricing'

type Props = {
  product: Product | null
  isNew: boolean
}

const CATEGORIES = ['Cleaning & Eco-Friendly', 'Laundry & Fabric Care', 'Home Convenience']
const STATUSES: { value: string; label: string; hint: string }[] = [
  { value: 'coming_soon', label: 'Coming Soon', hint: 'Hidden from customers.' },
  { value: 'out_of_stock', label: 'Out of Stock', hint: 'Hidden from customers until restocked.' },
  { value: 'available', label: 'Available', hint: 'Shown to customers and can be bought.' },
]
const MAX_PHOTOS = 8
const inputCls = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-chm-red transition-colors'
const labelCls = 'block text-xs text-gray-500 uppercase tracking-widest mb-1'

export default function ProductEditForm({ product, isNew }: Props) {
  const router = useRouter()
  // Keep a product's own category in the list even if it is not one of the standard three.
  const categoryOptions = product?.category && !CATEGORIES.includes(product.category)
    ? [...CATEGORIES, product.category]
    : CATEGORIES

  const initialPhotos = product?.image_urls?.length ? product.image_urls : product?.image_url ? [product.image_url] : []
  const sold = Number(product?.sold_qty ?? 0)

  const [fields, setFields] = useState({
    sku: product?.sku ?? '',
    title: product?.title ?? '',
    category: product?.category ?? CATEGORIES[0],
    description: product?.description ?? '',
    cost: product?.cost != null ? String(product.cost) : '',
    markup_percent: product?.markup_percent != null ? String(product.markup_percent) : '',
    weight_lb: product?.weight_lb != null ? String(product.weight_lb) : '',
    status: product?.status ?? 'coming_soon',
    stock_qty: product?.stock_qty != null ? String(product.stock_qty) : '',
    sort_order: product?.sort_order ?? 0,
  })
  const [photos, setPhotos] = useState<string[]>(initialPhotos)
  const [pasteUrl, setPasteUrl] = useState('')
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importNote, setImportNote] = useState('')
  const [importError, setImportError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  function setField(k: string, v: string | number) {
    setFields(f => ({ ...f, [k]: v }))
  }

  // Live sale price preview. The server calculates the saved price the same way.
  const costNum = fields.cost === '' ? null : Number(fields.cost)
  const markupNum = fields.markup_percent === '' ? 0 : Number(fields.markup_percent)
  const preview = costNum != null && Number.isFinite(costNum) && costNum >= 0 && Number.isFinite(markupNum) && markupNum >= 0
    ? salePrice(costNum, markupNum)
    : null
  const profit = preview != null && costNum != null ? Math.round((preview - costNum) * 100) / 100 : null

  const stockNum = fields.stock_qty === '' ? null : Number(fields.stock_qty)
  const balance = stockNum != null ? Math.max(0, stockNum - sold) : null

  async function importFromLink() {
    setImportNote('')
    setImportError('')
    if (!importUrl.trim()) {
      setImportError('Paste the product link into the box first, then click Fill in.')
      return
    }
    setImporting(true)
    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) throw new Error('Your admin sign-in has expired. Refresh the page and sign in again.')
      if (!res.ok) throw new Error(data.error ?? 'Could not read that link.')
      setFields(f => ({
        ...f,
        title: data.title || f.title,
        description: data.description || f.description,
        cost: data.cost != null ? String(data.cost) : f.cost,
      }))
      const gotPhotos = Array.isArray(data.image_urls) && data.image_urls.length > 0
      if (gotPhotos) {
        setPhotos(p => [...p, ...data.image_urls].slice(0, MAX_PHOTOS))
      }
      setImportNote(
        `Filled from the page. Please check the title and description.` +
        (gotPhotos ? '' : ' No photos could be copied, so upload them below.') +
        (data.cost != null ? ` The page showed $${Number(data.cost).toFixed(2)}; check it is what you paid.` : ' No price was on the page, so enter your cost.')
      )
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Could not read that link.')
    } finally {
      setImporting(false)
    }
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const room = MAX_PHOTOS - photos.length
    if (room <= 0) {
      setError(`You can add up to ${MAX_PHOTOS} photos per product.`)
      return
    }
    setUploading(true)
    setError('')
    const added: string[] = []
    try {
      for (const file of Array.from(files).slice(0, room)) {
        const fd = new FormData()
        fd.append('image', file)
        const res = await fetch('/api/admin/products/image', { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.url) throw new Error(data.error ?? 'Upload failed')
        added.push(data.url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setPhotos(p => [...p, ...added])
      setUploading(false)
    }
  }

  function addPastedPhoto() {
    const url = pasteUrl.trim()
    if (!/^https?:\/\//.test(url)) {
      setError('Paste a full link that starts with https://')
      return
    }
    if (photos.length >= MAX_PHOTOS) {
      setError(`You can add up to ${MAX_PHOTOS} photos per product.`)
      return
    }
    setPhotos(p => [...p, url])
    setPasteUrl('')
  }

  function makeMain(i: number) {
    setPhotos(p => [p[i], ...p.filter((_, j) => j !== i)])
  }

  function removePhoto(i: number) {
    setPhotos(p => p.filter((_, j) => j !== i))
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
          sku: fields.sku,
          title: fields.title,
          category: fields.category,
          description: fields.description,
          cost: fields.cost === '' ? null : Number(fields.cost),
          markup_percent: fields.markup_percent === '' ? 0 : Number(fields.markup_percent),
          weight_lb: fields.weight_lb === '' ? null : Number(fields.weight_lb),
          stock_qty: fields.stock_qty === '' ? null : Number(fields.stock_qty),
          status: fields.status,
          image_urls: photos,
          sort_order: fields.sort_order,
        }),
      })
      const data = await res.json().catch(() => ({}))
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

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-8">
      {isNew && (
        <div className="space-y-2 border border-gray-200 bg-cream p-4">
          <label className={labelCls}>Fill in from a product link (optional)</label>
          <div className="flex gap-2">
            <input value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); importFromLink() } }}
              className={inputCls} placeholder="https://supplier.example.com/product-page" />
            <button type="button" onClick={importFromLink} disabled={importing}
              className="border border-chm-red text-chm-red px-4 text-xs uppercase tracking-widest hover:bg-chm-red hover:text-white disabled:opacity-50 whitespace-nowrap">
              {importing ? 'Reading…' : 'Fill in'}
            </button>
          </div>
          {importing && <p className="text-xs text-gray-500">Reading the page. This can take up to 30 seconds.</p>}
          {importNote && <p className="text-xs text-green-700">{importNote}</p>}
          {importError && <p className="text-xs text-chm-red">{importError}</p>}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">Product Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isNew && (
            <div>
              <label className={labelCls}>SKU *</label>
              <input required value={fields.sku} onChange={e => setField('sku', e.target.value)} className={inputCls} placeholder="CHM-C01" />
            </div>
          )}
          <div className={isNew ? '' : 'sm:col-span-2'}>
            <label className={labelCls}>Title *</label>
            <input required value={fields.title} onChange={e => setField('title', e.target.value)} className={inputCls} placeholder="Eco All-Purpose Spray" />
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <select value={fields.category} onChange={e => setField('category', e.target.value)} className={inputCls}>
              {categoryOptions.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sort Order</label>
            <input type="number" value={fields.sort_order} onChange={e => setField('sort_order', Number(e.target.value))} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea rows={4} value={fields.description} onChange={e => setField('description', e.target.value)}
              className={`${inputCls} resize-none`} placeholder="What it is, what it is used for, and its benefits." />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">Status</h2>
        <div className="grid grid-cols-3 gap-2">
          {STATUSES.map(s => (
            <button key={s.value} type="button" onClick={() => setField('status', s.value)}
              className={`px-3 py-3 text-xs font-semibold uppercase tracking-widest border ${fields.status === s.value ? 'bg-chm-red border-chm-red text-white' : 'border-gray-200 text-gray-500 hover:border-chm-black'}`}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">{STATUSES.find(s => s.value === fields.status)?.hint}</p>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">Stock</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Quantity received</label>
            <input type="number" min="0" step="1" value={fields.stock_qty} onChange={e => setField('stock_qty', e.target.value)} className={inputCls} placeholder="leave empty if not counted" />
          </div>
          <div>
            <label className={labelCls}>Sold so far</label>
            <div className="border border-gray-200 px-3 py-2 text-sm bg-gray-50">{sold}</div>
          </div>
          <div>
            <label className={labelCls}>Balance left</label>
            <div className="border border-gray-200 px-3 py-2 text-sm bg-gray-50">{balance == null ? 'not counted' : balance}</div>
          </div>
        </div>
        {balance === 0 && <p className="text-xs text-amber-700">No stock left. Customers cannot buy this until you add more stock.</p>}
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Cost you paid ($)</label>
            <input type="number" step="0.01" min="0" value={fields.cost} onChange={e => setField('cost', e.target.value)} className={inputCls} placeholder="10.00" />
          </div>
          <div>
            <label className={labelCls}>Markup (%)</label>
            <input type="number" step="0.01" min="0" value={fields.markup_percent} onChange={e => setField('markup_percent', e.target.value)} className={inputCls} placeholder="50" />
          </div>
          <div>
            <label className={labelCls}>Weight (lb)</label>
            <input type="number" step="0.01" min="0" value={fields.weight_lb} onChange={e => setField('weight_lb', e.target.value)} className={inputCls} placeholder="1.5" />
          </div>
        </div>
        <div className="border border-gray-200 bg-cream p-4 text-sm">
          <p>Sale price (shown to customers): <strong>{preview != null ? `$${preview.toFixed(2)}` : 'enter the cost'}</strong></p>
          {profit != null && <p className="text-gray-500 mt-1">Your profit per sale: ${profit.toFixed(2)}</p>}
          <p className="text-xs text-gray-400 mt-2">Sale price = cost + markup % of your cost. Saved automatically.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">Photos</h2>
        {photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map((url, i) => (
              <div key={url + i} className="border border-gray-200 p-1">
                <img src={url} alt={`photo ${i + 1}`} className="w-full h-28 object-cover" />
                <div className="flex justify-between items-center mt-1 text-xs">
                  {i === 0 ? <span className="text-chm-red font-semibold">Main</span> : <button type="button" onClick={() => makeMain(i)} className="underline">Make main</button>}
                  <button type="button" onClick={() => removePhoto(i)} className="text-gray-400 hover:text-chm-red">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <label className={labelCls}>Upload photos (up to {MAX_PHOTOS})</label>
          <input type="file" accept="image/*" multiple disabled={uploading || photos.length >= MAX_PHOTOS}
            onChange={e => { uploadFiles(e.target.files); e.target.value = '' }} className="w-full text-sm" />
          {uploading && <p className="text-xs text-gray-500 mt-1">Uploading…</p>}
        </div>
        <div className="flex gap-2">
          <input value={pasteUrl} onChange={e => setPasteUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPastedPhoto() } }}
            className={inputCls} placeholder="or paste a photo link (https://…)" />
          <button type="button" onClick={addPastedPhoto} className="border border-gray-200 px-4 text-xs uppercase tracking-widest">Add</button>
        </div>
      </div>

      {error && <p className="text-chm-red text-sm">{error}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex gap-3">
          <button type="submit" disabled={saving || uploading}
            className="bg-chm-red text-white px-8 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/products')}
            className="border border-gray-200 text-gray-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-chm-black hover:text-chm-black transition-colors">
            Cancel
          </button>
          {!isNew && (
            <Link href={`/admin/products/${product!.id}/view`} className="border border-gray-200 text-gray-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-chm-black hover:text-chm-black">
              View
            </Link>
          )}
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
