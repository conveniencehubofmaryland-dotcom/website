'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Module = {
  id: string
  title: string
  description: string
  position: string
  content: string
  quiz_questions: Array<{ id: string; question: string; options: string[]; correct_answer: string }>
  created_at: string
}

const positions = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary / Chef',
  'Nanny / Childcare Specialist',
  'Care Companion (Adult/Senior)',
  'Housekeeping Staff',
]

export default function ModulesAdminPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: '',
    content: '',
  })

  useEffect(() => {
    fetchModules()
  }, [])

  async function fetchModules() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/modules')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setModules(data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.position.trim()) {
      alert('Title and Position are required')
      return
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/admin/modules/${editingId}` : '/api/admin/modules'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to save module')
      
      await fetchModules()
      resetForm()
      alert(editingId ? 'Module updated!' : 'Module created!')
    } catch (err) {
      console.error('Error:', err)
      alert('Error saving module')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this module?')) return

    try {
      const res = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await fetchModules()
      alert('Module deleted!')
    } catch (err) {
      console.error('Error:', err)
      alert('Error deleting module')
    }
  }

  function resetForm() {
    setFormData({ title: '', description: '', position: '', content: '' })
    setEditingId(null)
    setShowForm(false)
  }

  function handleEdit(module: Module) {
    setFormData({
      title: module.title,
      description: module.description,
      position: module.position,
      content: module.content,
    })
    setEditingId(module.id)
    setShowForm(true)
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-cream py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <Link href="/admin" className="text-xs text-gray-400 hover:text-chm-red uppercase tracking-widest mb-4 inline-block">
            ← Back to Admin
          </Link>
          <h1 className="font-serif text-4xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Manage Training Modules
          </h1>
          <p className="text-gray-500 text-sm mt-3">Create, edit, and delete training modules</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Create Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-12 bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700"
          >
            + Create New Module
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-12 bg-gray-50 border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-chm-black mb-6">
              {editingId ? 'Edit Module' : 'Create New Module'}
            </h2>

            <div className="space-y-6">
              <div>
  <label className="block text-xs uppercase tracking-widest text-gray-600 mb-2">Position *</label>
  <input
    type="text"
    value={formData.position}
    onChange={e => setFormData({ ...formData, position: e.target.value })}
    placeholder="e.g., Cleaning Specialist, Laundry Handler, etc."
    list="positionList"
    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
  />
  <datalist id="positionList">
    {positions.map(pos => (
      <option key={pos} value={pos} />
    ))}
  </datalist>
  <p className="text-xs text-gray-500 mt-2">Start typing to see suggestions, or enter a custom position</p>
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
                <select
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-chm-red"
                >
                  <option value="">Select a position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
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
                  className="bg-chm-red text-white px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700"
                >
                  {editingId ? 'Update Module' : 'Create Module'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border-2 border-gray-200 text-gray-600 px-8 py-3 font-semibold text-sm uppercase tracking-widest hover:border-chm-red hover:text-chm-red"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Modules List */}
        <div>
          <h2 className="text-2xl font-semibold text-chm-black mb-6">All Modules ({modules.length})</h2>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading modules...</p>
          ) : modules.length === 0 ? (
            <p className="text-gray-400 text-sm">No modules created yet.</p>
          ) : (
            <div className="space-y-4">
              {modules.map(module => (
                <div key={module.id} className="border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-chm-black mb-2">{module.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Position: <strong>{module.position}</strong></span>
                        <span>Created: <strong>{new Date(module.created_at).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(module)}
                        className="px-6 py-2 border-2 border-chm-red text-chm-red font-semibold text-sm uppercase tracking-widest hover:bg-red-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(module.id)}
                        className="px-6 py-2 bg-red-100 text-red-700 font-semibold text-sm uppercase tracking-widest hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
