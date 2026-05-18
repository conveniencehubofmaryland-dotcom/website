'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Service, PricingItem } from '@/lib/types'


type Props = {
  service: Service | null
  isNew: boolean
}

const EMPTY_ITEM: PricingItem = { section: '', label: '', price: '', unit: '', note: '' }

export default function ServiceEditForm({ service, isNew }: Props) {
  const router = useRouter()

  const [fields, setFields] = useState({
    id:          service?.id          ?? '',
    title:       service?.title       ?? '',
    subtitle:    service?.subtitle    ?? '',
    description: service?.description ?? '',
    price_from:  service?.price_from  ?? '',
    sort_order:  service?.sort_order  ?? 0,
    active:      service?.active      ?? true,
  })
  const [items, setItems]   = useState<PricingItem[]>(service?.pricing_details ?? [{ ...EMPTY_ITEM }])
  const [saving,  setSaving]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error,   setError]   = useState('')

  function setField(k: string, v: string | number | boolean) {
    setFields(f => ({ ...f, [k]: v }))
  }

  function setItem(i: number, k: keyof PricingItem, v: string) {
    setItems(rows => rows.map((r, idx) => idx === i ? { ...r, [k]: v } : r))
  }

  function addItem() {
    setItems(rows => [...rows, { ...EMPTY_ITEM }])
  }

  function removeItem(i: number) {
    setItems(rows => rows.filter((_, idx) => idx !== i))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...fields,
        pricing_details: items.filter(r => r.label.trim() && r.price.trim()),
      }
      const url = isNew ? '/api/admin/services' : `/api/admin/services/${service!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      router.push('/admin/services')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${fields.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/services/${service!.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/admin/services')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleting(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-chm-red transition-colors'

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-10">

      {/* Basic info */}
      <div className="space-y-4">
        <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest border-b border-gray-100 pb-3">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isNew && (
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">ID (slug) *</label>
              <input required value={fields.id} onChange={e => setField('id', e.target.value)}
                className={inputCls} placeholder="e.g. cleaning" />
              <p className="text-xs text-gray-400 mt-1">Lowercase, no spaces. e.g. cleaning, laundry</p>
            </div>
          )}
          <div className={isNew ? '' : 'sm:col-span-2'}>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Title *</label>
            <input required value={fields.title} onChange={e => setField('title', e.target.value)}
              className={inputCls} placeholder="Professional Cleaning & Estate Care" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Subtitle</label>
            <input value={fields.subtitle} onChange={e => setField('subtitle', e.target.value)}
              className={inputCls} placeholder="Residential · Commercial · Estate" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Price From (shown on home page)</label>
            <input value={fields.price_from} onChange={e => setField('price_from', e.target.value)}
              className={inputCls} placeholder="From $100/visit" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Description</label>
            <textarea rows={3} value={fields.description} onChange={e => setField('description', e.target.value)}
              className={`${inputCls} resize-none`} placeholder="Brief service description shown on service cards" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Sort Order</label>
            <input type="number" value={fields.sort_order} onChange={e => setField('sort_order', Number(e.target.value))}
              className={inputCls} />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="active" checked={fields.active} onChange={e => setField('active', e.target.checked)}
              className="w-4 h-4 accent-chm-red" />
            <label htmlFor="active" className="text-sm text-chm-black">Active (visible on site)</label>
          </div>
        </div>
      </div>

      {/* Pricing items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="font-semibold text-chm-black text-sm uppercase tracking-widest">Pricing Details</h2>
          <button type="button" onClick={addItem}
            className="text-xs bg-chm-black text-white px-4 py-1.5 uppercase tracking-wide hover:bg-chm-red transition-colors">
            + Add Row
          </button>
        </div>
        <p className="text-xs text-gray-400">Group rows by typing the same Section Name. Leave Section blank if only one group.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['Section Name', 'Label *', 'Price *', 'Unit', 'Note', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap border border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-1 py-1 w-40">
                    <input value={item.section ?? ''} onChange={e => setItem(i, 'section', e.target.value)}
                      className="w-full border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-chm-red"
                      placeholder="e.g. Standard Rates" />
                  </td>
                  <td className="px-1 py-1 w-40">
                    <input value={item.label} onChange={e => setItem(i, 'label', e.target.value)}
                      className="w-full border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-chm-red"
                      placeholder="1 Bed / 1 Bath" />
                  </td>
                  <td className="px-1 py-1 w-32">
                    <input value={item.price} onChange={e => setItem(i, 'price', e.target.value)}
                      className="w-full border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-chm-red"
                      placeholder="$130–$200" />
                  </td>
                  <td className="px-1 py-1 w-24">
                    <input value={item.unit ?? ''} onChange={e => setItem(i, 'unit', e.target.value)}
                      className="w-full border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-chm-red"
                      placeholder="/lb" />
                  </td>
                  <td className="px-1 py-1">
                    <input value={item.note ?? ''} onChange={e => setItem(i, 'note', e.target.value)}
                      className="w-full border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:border-chm-red"
                      placeholder="optional note" />
                  </td>
                  <td className="px-2 py-1 text-center">
                    <button type="button" onClick={() => removeItem(i)}
                      className="text-gray-300 hover:text-chm-red transition-colors text-lg leading-none">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No pricing rows yet. Click "+ Add Row" to add one.</p>
        )}
      </div>

      {error && <p className="text-chm-red text-sm">{error}</p>}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-chm-red text-white px-8 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin/services')}
            className="border border-gray-200 text-gray-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-chm-black hover:text-chm-black transition-colors">
            Cancel
          </button>
        </div>
        {!isNew && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="text-xs text-gray-400 hover:text-chm-red transition-colors disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete Service'}
          </button>
        )}
      </div>
    </form>
  )
}
