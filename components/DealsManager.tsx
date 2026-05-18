'use client'
import { useState } from 'react'
import type { Deal } from '@/lib/types'


type Props = { initialDeals: Deal[] }

const EMPTY: Omit<Deal, 'id' | 'created_at'> = {
  badge: '', headline: '', detail: '', sort_order: 0, active: true,
}

export default function DealsManager({ initialDeals }: Props) {
  const [deals, setDeals]   = useState<Deal[]>(initialDeals)
  const [editing, setEditing] = useState<string | null>(null)   // deal id being edited
  const [draft,   setDraft]   = useState<Partial<Deal>>({})
  const [adding,  setAdding]  = useState(false)
  const [newDeal, setNewDeal] = useState<Omit<Deal, 'id' | 'created_at'>>({ ...EMPTY })
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  // ── Edit existing ──────────────────────────────────
  function startEdit(d: Deal) {
    setEditing(d.id)
    setDraft({ badge: d.badge, headline: d.headline, detail: d.detail ?? '', sort_order: d.sort_order, active: d.active })
    setError('')
  }

  function cancelEdit() { setEditing(null); setDraft({}) }

  async function saveEdit(id: string) {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      setDeals(ds => ds.map(d => d.id === id ? { ...d, ...draft } as Deal : d))
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  async function toggleActive(d: Deal) {
    const updated = { active: !d.active }
    const res = await fetch(`/api/admin/deals/${d.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    if (res.ok) setDeals(ds => ds.map(x => x.id === d.id ? { ...x, ...updated } : x))
  }

  async function deleteDeal(id: string, headline: string) {
    if (!confirm(`Delete "${headline}"?`)) return
    const res = await fetch(`/api/admin/deals/${id}`, { method: 'DELETE' })
    if (res.ok) setDeals(ds => ds.filter(d => d.id !== id))
    else setError('Delete failed')
  }

  // ── Add new ────────────────────────────────────────
  async function saveNew(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed')
      // Refetch list
      const list = await fetch('/api/admin/deals').then(r => r.json())
      setDeals(list)
      setAdding(false)
      setNewDeal({ ...EMPTY })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const inputCls = 'w-full border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-chm-red transition-colors'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{deals.length} deal{deals.length !== 1 ? 's' : ''}</p>
        {!adding && (
          <button onClick={() => { setAdding(true); setError('') }}
            className="bg-chm-red text-white px-6 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors">
            + New Deal
          </button>
        )}
      </div>

      {error && <p className="text-chm-red text-sm">{error}</p>}

      {/* New deal form */}
      {adding && (
        <form onSubmit={saveNew} className="bg-amber-50/60 border border-amber-200 p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">New Deal</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Badge Label *</label>
              <input required value={newDeal.badge} onChange={e => setNewDeal(d => ({ ...d, badge: e.target.value }))}
                className={inputCls} placeholder="Monday Deal" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Sort Order</label>
              <input type="number" value={newDeal.sort_order} onChange={e => setNewDeal(d => ({ ...d, sort_order: Number(e.target.value) }))}
                className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Headline *</label>
              <input required value={newDeal.headline} onChange={e => setNewDeal(d => ({ ...d, headline: e.target.value }))}
                className={inputCls} placeholder="$20 Flat — 10 lbs Colored Laundry" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Detail</label>
              <textarea rows={2} value={newDeal.detail ?? ''} onChange={e => setNewDeal(d => ({ ...d, detail: e.target.value }))}
                className={`${inputCls} resize-none`} placeholder="Description of the deal…" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="bg-chm-red text-white px-6 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save Deal'}
            </button>
            <button type="button" onClick={() => { setAdding(false); setError('') }}
              className="border border-gray-200 text-gray-500 px-5 py-2 text-xs uppercase tracking-widest hover:border-chm-black hover:text-chm-black transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Deal list */}
      {deals.length === 0 && !adding ? (
        <div className="text-center py-16 border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No deals yet. Click "+ New Deal" to add one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map(d => (
            <div key={d.id} className={`border p-5 ${editing === d.id ? 'border-chm-red/30 bg-red-50/20' : 'border-gray-100 bg-white hover:bg-gray-50/60'} transition-colors`}>
              {editing === d.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Badge</label>
                      <input value={draft.badge ?? ''} onChange={e => setDraft(x => ({ ...x, badge: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Sort Order</label>
                      <input type="number" value={draft.sort_order ?? 0} onChange={e => setDraft(x => ({ ...x, sort_order: Number(e.target.value) }))}
                        className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Headline</label>
                      <input value={draft.headline ?? ''} onChange={e => setDraft(x => ({ ...x, headline: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Detail</label>
                      <textarea rows={2} value={draft.detail ?? ''} onChange={e => setDraft(x => ({ ...x, detail: e.target.value }))}
                        className={`${inputCls} resize-none`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id={`active-${d.id}`} checked={draft.active ?? true}
                        onChange={e => setDraft(x => ({ ...x, active: e.target.checked }))}
                        className="w-4 h-4 accent-chm-red" />
                      <label htmlFor={`active-${d.id}`} className="text-sm text-chm-black">Active</label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => saveEdit(d.id)} disabled={saving}
                      className="bg-chm-red text-white px-5 py-1.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 disabled:opacity-60 transition-colors">
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={cancelEdit}
                      className="border border-gray-200 text-gray-500 px-4 py-1.5 text-xs uppercase tracking-widest hover:border-chm-black transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-semibold uppercase tracking-widest text-chm-red border border-chm-red/30 px-2 py-0.5 shrink-0">
                        {d.badge}
                      </span>
                      {!d.active && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5">Hidden</span>
                      )}
                    </div>
                    <p className="font-semibold text-chm-black text-sm">{d.headline}</p>
                    {d.detail && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{d.detail}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button onClick={() => toggleActive(d)}
                      className="text-xs text-gray-400 hover:text-chm-black transition-colors">
                      {d.active ? 'Hide' : 'Show'}
                    </button>
                    <button onClick={() => startEdit(d)}
                      className="text-xs text-chm-red hover:underline underline-offset-4">
                      Edit
                    </button>
                    <button onClick={() => deleteDeal(d.id, d.headline)}
                      className="text-xs text-gray-300 hover:text-chm-red transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
