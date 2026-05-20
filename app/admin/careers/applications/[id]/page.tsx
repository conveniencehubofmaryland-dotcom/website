import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'
import type { JobApplication } from '@/lib/types'
import ApplicationStatusSelect from '@/components/ApplicationStatusSelect'


export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const rows = await dbSelectAuth<JobApplication>('job_applications', token, { id: `eq.${id}` })
  const app = rows[0] ?? null

  if (!app) {
    return (
      <div>
        <Link href="/admin/careers/applications" className="text-xs text-gray-400 hover:text-chm-red uppercase tracking-widest">← Applications</Link>
        <p className="text-chm-red text-sm mt-4">Application not found.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/careers/applications" className="text-xs text-gray-400 hover:text-chm-red transition-colors uppercase tracking-widest">
          ← Applications
        </Link>
        <span className="text-gray-200">/</span>
        <h1 className="font-serif text-2xl text-chm-black">{app.name}</h1>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Status */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Status</p>
          <ApplicationStatusSelect id={app.id} initialStatus={app.status} />
        </div>

        {/* Contact info */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Contact Information</p>
          <table className="text-sm w-full">
            <tbody>
              <Row label="Name"    value={app.name} />
              <Row label="Phone"   value={<a href={`tel:${app.phone}`} className="text-chm-red hover:underline">{app.phone}</a>} />
              <Row label="Email"   value={<a href={`mailto:${app.email}`} className="text-chm-red hover:underline">{app.email}</a>} />
              {app.address && <Row label="Address" value={app.address} />}
              {app.city    && <Row label="City"    value={app.city} />}
              <Row label="State"   value={app.state} />
              {app.gender  && <Row label="Gender"  value={app.gender} />}
            </tbody>
          </table>
        </div>

        {/* Availability */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Availability</p>
          <table className="text-sm w-full">
            <tbody>
              <Row label="Days"    value={app.days?.join(', ') || '—'} />
              <Row label="Hours"   value={app.hours || '—'} />
            </tbody>
          </table>
        </div>

        {/* Positions */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Positions of Interest</p>
          {app.positions && app.positions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {app.positions.map(p => (
                <span key={p} className="border border-gray-200 text-gray-500 text-xs px-3 py-1">{p}</span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">—</p>
          )}
        </div>

        {/* Experience */}
        {app.experience && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Experience & Background</p>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{app.experience}</p>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Applied {new Date(app.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-gray-50">
      <td className="py-2.5 pr-6 text-gray-400 text-xs uppercase tracking-wide w-28">{label}</td>
      <td className="py-2.5 text-chm-black">{value}</td>
    </tr>
  )
}
