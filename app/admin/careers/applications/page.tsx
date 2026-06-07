import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'
import type { JobApplication } from '@/lib/types'
import ApplicationActionButton from '@/components/ApplicationActionButton'

const STATUS_FILTERS = [
  { label: 'All',       value: 'all'       },
  { label: 'New',       value: 'new'       },
  { label: 'Reviewed',  value: 'reviewed'  },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Hired',     value: 'hired'     },
  { label: 'Rejected',  value: 'rejected'  },
]

const STATUS_STYLES: Record<string, string> = {
  new:       'bg-amber-50 text-amber-700',
  reviewed:  'bg-blue-50 text-blue-700',
  contacted: 'bg-purple-50 text-purple-700',
  hired:     'bg-green-50 text-green-700',
  rejected:  'bg-gray-100 text-gray-400',
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status = 'all' } = await searchParams
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const params: Record<string, string> = { order: 'created_at.desc' }
  if (status !== 'all') params.status = `eq.${status}`

  const applications = await dbSelectAuth<JobApplication>('job_applications', token, params)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin/careers" className="text-xs text-gray-400 hover:text-chm-red transition-colors uppercase tracking-widest">
              ← Careers
            </Link>
          </div>
          <h1 className="font-serif text-3xl text-chm-black">Applications</h1>
          <p className="text-sm text-gray-400 mt-1">{applications.length} result{applications.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(f => (
            <a key={f.value} href={`/admin/careers/applications?status=${f.value}`}
              className={`text-xs px-3 py-1.5 border uppercase tracking-wide font-semibold transition-colors ${
                status === f.value
                  ? 'bg-chm-black text-white border-chm-black'
                  : 'text-gray-500 border-gray-200 hover:border-chm-black hover:text-chm-black'
              }`}>
              {f.label}
            </a>
          ))}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No applications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(a => (
            <div key={a.id} className={`bg-white border p-5 flex items-start gap-4 ${a.status === 'new' ? 'border-amber-200' : 'border-gray-100'}`}>
              <Link href={`/admin/careers/applications/${a.id}`} className="flex-1 hover:opacity-80 transition-opacity">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <p className="font-semibold text-chm-black">{a.name}</p>
                  <span className={`text-xs px-2 py-0.5 capitalize ${STATUS_STYLES[a.status] ?? 'bg-gray-100 text-gray-400'}`}>
                    {a.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">{a.phone} · {a.email} · {a.state}</p>
                {a.positions && a.positions.length > 0 && (
                  <p className="text-gray-400 text-xs mt-1">{a.positions.join(', ')}</p>
                )}
              </Link>
              <ApplicationActionButton id={a.id} status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
