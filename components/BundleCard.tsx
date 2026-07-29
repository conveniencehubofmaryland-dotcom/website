import { Bundle } from '@/lib/bundles'

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <h3 className="font-serif text-xl text-chm-black mb-2">{bundle.name}</h3>
      
      {bundle.description && (
        <p className="text-sm text-gray-600 mb-4">{bundle.description}</p>
      )}

      <ul className="space-y-2 mb-6">
        {bundle.services.map((service, i) => (
          <li key={i} className="text-sm text-gray-700 flex items-start">
            <span className="text-chm-red mr-2">✓</span>
            {service}
          </li>
        ))}
      </ul>

      <div className="border-t-2 border-gray-100 pt-4">
        {bundle.regularPrice > 0 ? (
          <>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-chm-red">${bundle.bundlePrice.toLocaleString()}</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 line-through">
                Regular: ~${bundle.regularPrice.toLocaleString()}/month
              </span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                Save {bundle.savingsPercent}%
              </span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600 font-semibold">Custom Quote</p>
        )}
      </div>

      <button className="w-full mt-6 bg-chm-red text-white py-2 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
        Learn More
      </button>
    </div>
  )
}
