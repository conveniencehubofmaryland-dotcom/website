'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BundleRow, MembershipPlan, BundleService } from '@/lib/types'

const CATEGORIES = ['residential', 'family', 'senior', 'commercial'] as const

const inputCls = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-chm-black'
const labelCls = 'block text-xs uppercase tracking-widest text-gray-500 mb-1'
const btnCls = 'text-xs px-4 py-2 uppercase tracking-wide font-semibold bg-chm-black text-white disabled:opacity-50'
const dangerCls = 'text-xs px-4 py-2 uppercase tracking-wide font-semibold text-chm-red border border-chm-red disabled:opacity-50'

const servicesToText = (s: BundleService[]) =>
  s.map(x => (x.frequency ? `${x.name} | ${x.frequency}` : x.name)).join('\n')

const textToServices = (t: string): BundleService[] =>
  t.split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const [name, freq] = l.split('|').map(x => x.trim())
    return freq ? { name, frequency: freq } : { name }
  })

const linesToList = (t: string) => t.split('\n').map(l => l.trim()).filter(Boolean)

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Request failed')
  return data
}

function BundleFields({ f, set }: { f: BundleForm; set: (p: Partial<BundleForm>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Name</label>
        <input className={inputCls} value={f.name} onChange={e => set({ name: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Category</label>
        <select className={inputCls} value={f.category} onChange={e => set({ category: e.target.value as BundleRow['category'] })}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Monthly price ($, 0 = Custom Quote)</label>
        <input className={inputCls} inputMode="numeric" value={f.price} onChange={e => set({ price: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Savings %</label>
        <input className={inputCls} inputMode="numeric" value={f.savings_percent} onChange={e => set({ savings_percent: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Description</label>
        <input className={inputCls} value={f.description} onChange={e => set({ description: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Included services (one per line, optional frequency after a |)</label>
        <textarea className={inputCls} rows={5} value={f.services} onChange={e => set({ services: e.target.value })} placeholder="Weekly Cleaning | Weekly" />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={f.highlighted} onChange={e => set({ highlighted: e.target.checked })} /> Highlighted
      </label>
    </div>
  )
}

type BundleForm = {
  name: string
  category: BundleRow['category']
  price: string
  savings_percent: string
  description: string
  services: string
  highlighted: boolean
}

const bundleToForm = (b?: BundleRow): BundleForm => ({
  name: b?.name ?? '',
  category: b?.category ?? 'residential',
  price: b ? String(b.price) : '',
  savings_percent: b ? String(b.savings_percent) : '',
  description: b?.description ?? '',
  services: b ? servicesToText(b.services) : '',
  highlighted: b?.highlighted ?? false,
})

const bundlePayload = (f: BundleForm) => ({
  name: f.name.trim(),
  category: f.category,
  price: Number(f.price) || 0,
  savings_percent: Number(f.savings_percent) || 0,
  description: f.description.trim() || null,
  services: textToServices(f.services),
  highlighted: f.highlighted,
})

function BundleRowEditor({ row, onDone }: { row: BundleRow; onDone: () => void }) {
  const [f, setF] = useState<BundleForm>(bundleToForm(row))
  const [active, setActive] = useState(row.active)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (p: Partial<BundleForm>) => setF(prev => ({ ...prev, ...p }))

  const save = async () => {
    setBusy(true); setMsg('')
    try {
      await api(`/api/admin/bundles/${row.id}`, 'PATCH', { ...bundlePayload(f), active })
      setMsg('Saved'); onDone()
    } catch (e) { setMsg((e as Error).message) } finally { setBusy(false) }
  }
  const remove = async () => {
    if (!confirm(`Delete the "${row.name}" bundle? This cannot be undone.`)) return
    setBusy(true)
    try { await api(`/api/admin/bundles/${row.id}`, 'DELETE'); onDone() } catch (e) { setMsg((e as Error).message); setBusy(false) }
  }

  return (
    <div className="bg-white border border-gray-100 p-5 space-y-4">
      <BundleFields f={f} set={set} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600 mr-4">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Show on site
        </label>
        <button onClick={save} disabled={busy} className={btnCls}>Save</button>
        <button onClick={remove} disabled={busy} className={dangerCls}>Delete</button>
        {msg && <span className="text-xs text-gray-500">{msg}</span>}
      </div>
    </div>
  )
}

function NewBundle({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState<BundleForm>(bundleToForm())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (p: Partial<BundleForm>) => setF(prev => ({ ...prev, ...p }))
  const add = async () => {
    setBusy(true); setMsg('')
    try {
      await api('/api/admin/bundles', 'POST', bundlePayload(f))
      setF(bundleToForm()); onDone()
    } catch (e) { setMsg((e as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="bg-cream border border-gray-100 p-5 space-y-4">
      <p className="text-sm font-semibold text-chm-black">Add a bundle</p>
      <BundleFields f={f} set={set} />
      <div className="flex items-center gap-3">
        <button onClick={add} disabled={busy || !f.name.trim()} className={btnCls}>Add bundle</button>
        {msg && <span className="text-xs text-gray-500">{msg}</span>}
      </div>
    </div>
  )
}

type PlanForm = { name: string; tier: MembershipPlan['tier']; price_label: string; subtitle: string; features: string }

const planToForm = (p?: MembershipPlan): PlanForm => ({
  name: p?.name ?? '',
  tier: p?.tier ?? 'standard',
  price_label: p?.price_label ?? '',
  subtitle: p?.subtitle ?? '',
  features: p ? p.features.join('\n') : '',
})

const planPayload = (f: PlanForm) => ({
  name: f.name.trim(),
  tier: f.tier,
  price_label: f.price_label.trim() || null,
  subtitle: f.subtitle.trim() || null,
  features: linesToList(f.features),
})

function PlanFields({ f, set }: { f: PlanForm; set: (p: Partial<PlanForm>) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Plan name</label>
        <input className={inputCls} value={f.name} onChange={e => set({ name: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Card</label>
        <select className={inputCls} value={f.tier} onChange={e => set({ tier: e.target.value as MembershipPlan['tier'] })}>
          <option value="standard">Standard (left card)</option>
          <option value="premium">Premium (right card)</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Price line (e.g. $0 or Unlocked with)</label>
        <input className={inputCls} value={f.price_label} onChange={e => set({ price_label: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Subtitle (e.g. / forever)</label>
        <input className={inputCls} value={f.subtitle} onChange={e => set({ subtitle: e.target.value })} />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Features (one per line)</label>
        <textarea className={inputCls} rows={4} value={f.features} onChange={e => set({ features: e.target.value })} />
      </div>
    </div>
  )
}

function PlanEditor({ plan, onDone }: { plan: MembershipPlan; onDone: () => void }) {
  const [f, setF] = useState<PlanForm>(planToForm(plan))
  const [active, setActive] = useState(plan.active)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const set = (p: Partial<PlanForm>) => setF(prev => ({ ...prev, ...p }))
  const save = async () => {
    setBusy(true); setMsg('')
    try {
      await api(`/api/admin/membership-plans/${plan.id}`, 'PATCH', { ...planPayload(f), active })
      setMsg('Saved'); onDone()
    } catch (e) { setMsg((e as Error).message) } finally { setBusy(false) }
  }
  const remove = async () => {
    if (!confirm(`Delete the "${plan.name}" plan?`)) return
    setBusy(true)
    try { await api(`/api/admin/membership-plans/${plan.id}`, 'DELETE'); onDone() } catch (e) { setMsg((e as Error).message); setBusy(false) }
  }
  return (
    <div className="bg-white border border-gray-100 p-5 space-y-4">
      <PlanFields f={f} set={set} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600 mr-4">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Show on site
        </label>
        <button onClick={save} disabled={busy} className={btnCls}>Save</button>
        <button onClick={remove} disabled={busy} className={dangerCls}>Delete</button>
        {msg && <span className="text-xs text-gray-500">{msg}</span>}
      </div>
    </div>
  )
}

export default function BundlesManager({ initialBundles, initialPlans }: { initialBundles: BundleRow[]; initialPlans: MembershipPlan[] }) {
  const router = useRouter()
  const refresh = () => router.refresh()
  const [newPlan, setNewPlan] = useState<PlanForm>(planToForm())
  const [planBusy, setPlanBusy] = useState(false)
  const [planMsg, setPlanMsg] = useState('')

  const addPlan = async () => {
    setPlanBusy(true); setPlanMsg('')
    try {
      await api('/api/admin/membership-plans', 'POST', planPayload(newPlan))
      setNewPlan(planToForm()); refresh()
    } catch (e) { setPlanMsg((e as Error).message) } finally { setPlanBusy(false) }
  }

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl text-chm-black">Bundles</h2>
          <p className="text-sm text-gray-400 mt-1">Shown on the Deals page under Residential and Commercial Bundles. Changes appear on the site right after saving.</p>
        </div>
        {initialBundles.map(b => (
          <BundleRowEditor key={`${b.id}-${b.created_at}`} row={b} onDone={refresh} />
        ))}
        <NewBundle onDone={refresh} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl text-chm-black">Membership plans</h2>
          <p className="text-sm text-gray-400 mt-1">The two membership cards on the Deals page (Standard and Premium).</p>
        </div>
        {initialPlans.map(p => (
          <PlanEditor key={`${p.id}-${p.created_at}`} plan={p} onDone={refresh} />
        ))}
        <div className="bg-cream border border-gray-100 p-5 space-y-4">
          <p className="text-sm font-semibold text-chm-black">Add a membership plan</p>
          <PlanFields f={newPlan} set={p => setNewPlan(prev => ({ ...prev, ...p }))} />
          <div className="flex items-center gap-3">
            <button onClick={addPlan} disabled={planBusy || !newPlan.name.trim()} className={btnCls}>Add plan</button>
            {planMsg && <span className="text-xs text-gray-500">{planMsg}</span>}
          </div>
        </div>
      </section>
    </div>
  )
}
