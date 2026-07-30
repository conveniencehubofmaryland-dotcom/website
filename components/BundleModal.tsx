'use client'

import { useState } from 'react'
import { BUNDLES } from '@/lib/bundles'

interface BundleModalProps {
  onSelectBundle: (bundleId: string) => void
  onClose: () => void
}

export default function BundleModal({ onSelectBundle, onClose }: BundleModalProps) {
  const categories = [
    { key: 'residential', label: 'Residential', emoji: '🏠' },
    { key: 'family', label: 'Family with Children', emoji: '👨‍👩‍👧‍👦' },
    { key: 'senior', label: 'Senior Care', emoji: '👴' },
    { key: 'commercial', label: 'Commercial', emoji: '🏢' },
  ] as const

  const [selectedCategory, setSelectedCategory] = useState<'residential' | 'family' | 'senior' | 'commercial'>('residential')

  const categoryBundles = BUNDLES.filter(b => b.category === selectedCategory)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-chm-black mb-1">💡 Bundle Deals</h2>
            <p className="text-sm text-gray-600">Save up to 22% with our curated packages</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-4">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-chm-red text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bundles Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryBundles.map(bundle => (
              <div
                key={bundle.id}
                className={`border-2 rounded-lg p-6 transition-all ${
                  bundle.highlighted
                    ? 'border-chm-red bg-chm-red/5'
                    : 'border-gray-200 hover:border-chm-red'
                }`}
              >
                {/* Title & Price */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-serif text-xl text-chm-black">{bundle.name}</h3>
                    {bundle.highlighted && (
                      <span className="bg-chm-red text-white text-xs font-bold px-2 py-1 rounded">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-chm-red">
                      {bundle.price === 0 ? 'Custom' : `$${bundle.price}`}
                    </div>
                    {bundle.price > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Save {bundle.savingsPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services List */}
                <div className="mb-6 space-y-2">
                  {bundle.services.map((service, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-chm-red mt-1">✓</span>
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">{service.name}</div>
                        {service.frequency && (
                          <div className="text-xs text-gray-500">{service.frequency}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => {
                    onSelectBundle(bundle.id)
                    onClose()
                  }}
                  className={`w-full py-3 font-semibold text-xs uppercase tracking-widest rounded-lg transition-all ${
                    bundle.highlighted
                      ? 'bg-chm-red text-white hover:bg-red-700'
                      : 'bg-gray-100 text-chm-black hover:bg-chm-red hover:text-white'
                  }`}
                >
                  {bundle.price === 0 ? 'Get Custom Quote' : 'Select This Bundle'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
