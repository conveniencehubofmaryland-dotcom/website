'use client'

import { Bundle } from '@/lib/bundles'

interface BundleCardProps {
  bundle: Bundle
  onSelect: () => void
}

export default function BundleCard({ bundle, onSelect }: BundleCardProps) {
  return (
    <div className={`border-2 rounded-lg p-6 transition-all ${bundle.highlighted ? 'border-chm-red bg-chm-red/5' : 'border-gray-200 hover:border-chm-red'}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-serif text-xl text-chm-black">{bundle.name}</h3>
        {bundle.highlighted && <span className="bg-chm-red text-white text-xs font-bold px-2 py-1 rounded">POPULAR</span>}
      </div>

      <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>

      <div className="mb-6 space-y-2">
        {bundle.services.map((service, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-chm-red mt-1">✓</span>
            <div className="text-sm">
              <div className="text-gray-900 font-medium">{service.name}</div>
              {service.frequency && <div className="text-xs text-gray-500">{service.frequency}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-chm-red">${bundle.price}</div>
        {bundle.savingsPercent > 0 && (
          <div className="text-xs text-gray-600 mt-1">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Save {bundle.savingsPercent}%</span>
          </div>
        )}
      </div>

      <button
        onClick={onSelect}
        className={`w-full py-3 font-semibold text-xs uppercase tracking-widest rounded-lg transition-all ${
          bundle.highlighted
            ? 'bg-chm-red text-white hover:bg-red-700'
            : 'bg-gray-100 text-chm-black hover:bg-chm-red hover:text-white'
        }`}
      >
        {bundle.price === 0 ? 'Get Custom Quote' : 'Select This Bundle'}
      </button>
    </div>
  )
}
