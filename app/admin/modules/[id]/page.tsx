'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const positions = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary / Chef',
  'Nanny / Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]

export default function EditModulePage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: '',
    content: '',
  })

  useEffect(() => {
    if (!moduleId) return
    
    // Fetch module data
    fetch(`/api/admin/modules`)
      .then(r => r.json())
      .then(modules => {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const moduleData = modules.find((m: any) => m.id === moduleId)
        if (moduleData) {
  setFormData({
    title: moduleData.title || '',
            description: module.description || '',
            position: module.position || '',
            content: module.content || '',
          })
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading module:', err)
        setLoading(false)
      })
  }, [moduleId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.position.trim()) {
      alert('Title and Position are required')
      return
    }

    try {
      setSaving(true)
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to update module')
      
      alert('Module updated!')
      router.push('/admin/modules')
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this module?')) return

    try {
      setSaving(true)
      const res = await fetch(`/api/admin/modules/${moduleId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      alert('Module deleted!')
      router.push('/admin/modules')
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/modules" className="text-xs text-gray-400 hover:text-chm-red uppercase tracking-widest mb-4 inline-block">
          ← Back to Modules
        </Link>
        <h1 className="font-serif text-3xl text-chm-black">Edit Module</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={e => setFormData({ ...formData, position: e.target.value })}
              placeholder="e.g., Cleaning Specialist"
              list="positionList"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
            />
            <datalist id="positionList">
              {positions.map(pos => (
                <option key={pos} value={pos} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red font-mono"
              rows={12}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Module'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-100 text-red-700 px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-200 disabled:opacity-50"
            >
              Delete
            </button>
            <Link href="/admin/modules"
              className="border-2 border-gray-200 text-gray-600 px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:border-chm-red hover:text-chm-red">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
