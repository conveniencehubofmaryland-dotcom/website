'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JobPosting } from '@/lib/types'

const SERVICE_CATEGORIES = [
  'Cleaning & Estate Care',
  'Culinary & Housekeeping',
  'Laundry Pickup & Delivery',
  'Nanny & Care Services',
  'Commercial Operations',
]

interface Props {
  posting: JobPosting | null
  isNew: boolean
}

export default function JobPostingForm({ posting, isNew }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    title:            posting?.title ?? '',
    service_category: posting?.service_category ?? '',
    description:      posting?.description ?? '',
    active:           posting?.active ?? true,
  })
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]     = useState('')

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = isNew ? '/api/admin/careers' : `/api/admin/careers/${posting!.id}`
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      router.push('/admin/careers')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!posting || !confirm('Delete this job posting?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/careers/${posting.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      router.push('/admin/careers')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-5">
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Title *</label>
        <input required type="text" value={form.title} onChange={e => set('title', e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
          placeholder="Cleaning Specialist" />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Service Category</label>
        <select value={form.service_category} onChange={e => set('service_category', e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors bg-white">
          <option value="">None</option>
          {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Description</label>
        <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)}
          className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors resize-none"
          placeholder="Role responsibilities, requirements, etc." />
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" id="active" checked={form.active} onChange={e => set('active', e.target.checked)}
          className="w-4 h-4 accent-chm-red" />
        <label htmlFor="active" className="text-sm text-chm-black cursor-pointer">Active (visible on careers page)</label>
      </div>

      {error && <p className="text-chm-red text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="bg-chm-red text-white px-8 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60">
          {saving ? 'Saving…' : isNew ? 'Create Posting' : 'Save Changes'}
        </button>
        {!isNew && (
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="border border-gray-200 text-gray-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-chm-red hover:text-chm-red transition-colors disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </form>
  )
}
