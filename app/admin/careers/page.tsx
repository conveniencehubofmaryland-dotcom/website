import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'
import type { JobApplication } from '@/lib/types'


export default async function AdminCareersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const applications = await dbSelectAuth<JobApplication>('job_applications', token, { order: 'created_at.desc' })

  const newCount = applications.filter(a => a.status === 'new').length

  return (
    <div className="space-y-12">
      {/* Applications */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl text-chm-black">Job Applications</h2>
            <p className="text-sm text-gray-400 mt-1">
              {applications.length} total
              {newCount > 0 && <span className="ml-2 text-amber-600">{newCount} new</span>}
            </p>
          </div>
          <Link href="/admin/careers/applications"
            className="text-xs text-chm-red hover:underline underline-offset-4 uppercase tracking-widest font-semibold">
            View All →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No applications yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  {['Name', 'Phone', 'State', 'Positions', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map(a => (
                  <tr key={a.id} className={`border-b border-gray-100 hover:bg-gray-50 ${a.status === 'new' ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-3 px-4 font-semibold text-chm-black whitespace-nowrap">{a.name}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">{a.phone}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{a.state}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{a.positions?.slice(0, 2).join(', ') ?? '—'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/careers/applications/${a.id}`}
                        className="text-xs text-chm-red hover:underline underline-offset-4">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new:       'bg-amber-50 text-amber-700',
    reviewed:  'bg-blue-50 text-blue-700',
    contacted: 'bg-purple-50 text-purple-700',
    hired:     'bg-green-50 text-green-700',
    rejected:  'bg-gray-100 text-gray-400',
  }
  return (
    <span className={`text-xs px-2 py-0.5 capitalize ${styles[status] ?? 'bg-gray-100 text-gray-400'}`}>
      {status}
    </span>
  )
}
