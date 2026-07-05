/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'

export default async function AdminModulesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  
  console.log('[modules PAGE] Token exists:', !!token)
  console.log('[modules PAGE] Token value:', token?.substring(0, 20))
  
  const modules = await dbSelectAuth('training_modules', token)
  
  console.log('[modules PAGE] Modules result:', {
    isArray: Array.isArray(modules),
    count: modules?.length,
    first: modules?.[0],
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-chm-black">Training Modules</h1>
          <p className="text-sm text-gray-400 mt-1">{modules.length} module{modules.length !== 1 ? 's' : ''} in database</p>
        </div>
        <Link href="/admin/modules/new"
          className="bg-chm-red text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-red-700 transition-colors">
          + New Module
        </Link>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm mb-4">No modules in database yet.</p>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Create your first training module using the button above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                {['Title', 'Position', 'Description', 'Created', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((m: any) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-chm-black">{m.title}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{m.position}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm max-w-xs truncate">{m.description || '—'}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/modules/${m.id}`}
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
