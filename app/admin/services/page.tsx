import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'
import type { Service } from '@/lib/types'


export default async function AdminServicesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  const services = await dbSelectAuth<Service>('services', token, { order: 'sort_order' })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-chm-black">Services</h1>
          <p className="text-sm text-gray-400 mt-1">{services.length} service{services.length !== 1 ? 's' : ''} in database</p>
        </div>
        <Link href="/admin/services/new"
          className="bg-chm-red text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors">
          + New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm mb-4">No services in database yet.</p>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Run the SQL seed script in Supabase to import the default services, or add them manually using the button above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                {['Order', 'ID', 'Title', 'Price From', 'Pricing Rows', 'Active', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-400 text-xs">{s.sort_order}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{s.id}</td>
                  <td className="py-3 px-4 font-semibold text-chm-black">{s.title}</td>
                  <td className="py-3 px-4 text-gray-500">{s.price_from ?? '—'}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{s.pricing_details?.length ?? 0} rows</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 ${s.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {s.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/services/${s.id}`}
                      className="text-xs text-chm-red hover:underline underline-offset-4">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
