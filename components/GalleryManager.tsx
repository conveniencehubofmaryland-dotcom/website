'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

const CATEGORIES = [
  { value: 'cleaning', label: 'Cleaning & Estate Care' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'culinary', label: 'Culinary & Housekeeping' },
  { value: 'care', label: 'Nanny & Care' },
  { value: 'commercial', label: 'Commercial & Special Projects' },
]

export default function GalleryManager({ initialItems }: { initialItems: GalleryItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('cleaning')
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!beforeFile || !afterFile) {
      setStatus('error')
      setErrorMsg('Please select both a before and after photo.')
      return
    }
    setStatus('submitting')
    setErrorMsg('')

    const formData = new FormData()
    formData.append('title', title)
    formData.append('service_category', category)
    formData.append('before_image', beforeFile)
    formData.append('after_image', afterFile)

    try {
      const res = await fetch('/api/admin/gallery', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Upload failed')
      }
      setTitle('')
      setBeforeFile(null)
      setAfterFile(null)
      setStatus('idle')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this gallery item?')) return
    const res = await fetch('/api/admin/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setItems(items.filter(i => i.id !== id))
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded p-6 space-y-4 max-w-xl">
        <h2 className="font-semibold text-chm-black">Add Before / After Pair</h2>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Title</label>
          <input
            required
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red"
            placeholder="e.g. Kitchen Deep Clean"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Service Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-chm-red"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Before Photo</label>
          <input required type="file" accept="image/*" onChange={e => setBeforeFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">After Photo</label>
          <input required type="file" accept="image/*" onChange={e => setAfterFile(e.target.files?.[0] ?? null)} className="w-full text-sm" />
        </div>
        {status === 'error' && <p className="text-chm-red text-sm">{errorMsg}</p>}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-chm-red text-white px-6 py-2.5 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {status === 'submitting' ? 'Uploading…' : 'Add to Gallery'}
        </button>
      </form>

      <div>
        <h2 className="font-semibold text-chm-black mb-4">Current Gallery Items ({items.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="border border-gray-200 rounded overflow-hidden">
              <div className="grid grid-cols-2">
                <img src={item.before_image_url} alt={`${item.title} before`} className="w-full h-32 object-cover" />
                <img src={item.after_image_url} alt={`${item.title} after`} className="w-full h-32 object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-chm-black">{item.title}</p>
                <p className="text-xs text-gray-500 mb-2">{item.service_category}</p>
                <button onClick={() => handleDelete(item.id)} className="text-xs text-chm-red hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
