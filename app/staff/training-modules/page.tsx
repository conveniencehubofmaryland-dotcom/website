'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { TrainingModule } from '@/lib/types'

export default function TrainingModulesPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [selectedPosition, setSelectedPosition] = useState('')
  const [staffName, setStaffName] = useState('')
  const [staffPhone, setStaffPhone] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const positions = [
    'Cleaning Specialist',
    'Laundry Handler',
    'Culinary & Housekeeping Staff',
    'Nanny / Childcare Staff',
    'Care Companion (Adult)',
    'Commercial Cleaner',
  ]

  useEffect(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    if (selectedPosition) {
      fetchModules(selectedPosition)
    }
  }, [selectedPosition])

  async function fetchModules(position: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/training/modules?position=${encodeURIComponent(position)}`)
      if (!res.ok) throw new Error('Failed to fetch modules')
      const data = await res.json()
      setModules(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading modules')
      setModules([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Training & Certification</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Get Certified
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            Complete training modules for your position and earn your certification.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
        {/* Staff Info Section */}
        <div className="bg-gray-50 border border-gray-200 p-8 mb-12">
          <h2 className="text-lg font-semibold text-chm-black mb-6">Your Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  <div>
    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
    <input
      type="text"
      value={staffName}
      onChange={e => setStaffName(e.target.value)}
      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
      placeholder="Your name"
    />
  </div>
  <div>
    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
    <input
      type="email"
      value={staffEmail}
      onChange={e => setStaffEmail(e.target.value)}
      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
      placeholder="your@email.com"
    />
  </div>
  <div>
    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Phone</label>
    <input
      type="tel"
      value={staffPhone}
      onChange={e => setStaffPhone(e.target.value)}
      className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors"
      placeholder="202-555-0100"
    />
  </div>
</div>

        {/* Position Selection */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-chm-black mb-4">Select Your Position</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`border-2 px-4 py-3 text-sm text-left transition-all ${
                  selectedPosition === pos
                    ? 'border-chm-red bg-red-50 text-chm-black font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-chm-red'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Modules List */}
        {selectedPosition && (
          <div>
            <h2 className="text-lg font-semibold text-chm-black mb-6">Available Training Modules</h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading modules...</p>
            ) : error ? (
              <p className="text-chm-red text-sm">{error}</p>
            ) : modules.length === 0 ? (
              <p className="text-gray-400 text-sm">No training modules available for this position yet.</p>
            ) : (
              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module.id} className="border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-chm-black text-lg mb-2">{module.title}</h3>
                        <p className="text-gray-500 text-sm mb-4">{module.description}</p>
                        <p className="text-xs text-gray-400">Position: {module.position}</p>
                      </div>
                      <Link
                        href={`/staff/training-modules/${module.id}?name=${encodeURIComponent(staffName)}&phone=${encodeURIComponent(staffPhone)}`}
                        className={`px-6 py-2 text-sm font-semibold uppercase tracking-widest whitespace-nowrap transition-colors ${
                          staffName && staffPhone && staffEmail
                            ? 'bg-chm-red text-white hover:bg-red-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={e => {
                          if (!staffName || !staffPhone) {
                            e.preventDefault()
                          }
                        }}
                      >
                        Start Module
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
