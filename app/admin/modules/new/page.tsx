'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const positions = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary / Chef',
  'Nanny / Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]

export default function NewModulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: '',
    content: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.position.trim()) {
      alert('Title and Position are required')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create module')
      }

      alert('Module created!')
      router.push('/admin/modules')
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/modules" className="text-xs text-gray-400 hover:text-chm-red uppercase tracking-widest mb-4 inline-block">
          ← Back to Modules
        </Link>
        <h1 className="font-serif text-3xl text-chm-black">Create New Module</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 p-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
              placeholder="e.g., Professional Cleaning & Estate Care"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
              rows={3}
              placeholder="Brief description of the module"
            />
          </div>

         <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Position *</label>
            <input
              type="text"
              value={formData.position}
              onChange={e => setFormData({ ...formData, position: e.target.value })}
              placeholder="e.g., Cleaning Specialist"
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
            />
            <p className="text-xs text-gray-500 mt-2">Common positions: Cleaning Specialist, Laundry Handler, Culinary / Chef, Nanny / Childcare Specialist, Care Companion (Adult/Senior), Housekeeping Staff</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red font-mono"
              rows={12}
              placeholder="Module content (use \n for line breaks)"
            />
            <p className="text-xs text-gray-500 mt-2">Tip: Use \n for line breaks in content</p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Module'}
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
