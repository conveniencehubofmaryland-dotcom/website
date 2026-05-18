import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { Appointment } from '@/lib/types'
import AppointmentStatusButton from '@/components/AppointmentStatusButton'

export const runtime = 'edge'

type AppointmentRow = Omit<Appointment, 'services'> & {
  services?: { title: string } | null
}

const STATUS_FILTER_LABELS = ['all', 'pending', 'confirmed', 'cancelled'] as const

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus = 'all' } = await searchParams
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const params: Record<string, string> = {
    select: '*,services(title)',
    order:  'appointment_date.desc,created_at.desc',
  }
  if (filterStatus !== 'all') params.status = `eq.${filterStatus}`

  const appointments = await dbSelectAuth<AppointmentRow>('appointments', token, params)

  const pendingCount = appointments.filter(a => a.status === 'pending').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-chm-black">Appointments</h1>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-1">{pendingCount} awaiting confirmation</p>
          )}
        </div>

        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTER_LABELS.map(s => (
            <a
              key={s}
              href={s === 'all' ? '/admin/appointments' : `/admin/appointments?status=${s}`}
              className={`text-xs px-3 py-1.5 border uppercase tracking-wide font-semibold transition-colors ${
                filterStatus === s
                  ? 'bg-chm-black text-white border-chm-black'
                  : 'text-gray-500 border-gray-200 hover:border-chm-black hover:text-chm-black'
              }`}
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No appointments found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                {['Customer', 'Date & Time', 'Service', 'Contact', 'Notes', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id} className={`border-b border-gray-100 hover:bg-gray-50 ${a.status === 'pending' ? 'bg-amber-50/40' : ''}`}>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-chm-black whitespace-nowrap">{a.customer_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="font-medium text-chm-black">{a.appointment_date}</p>
                    <p className="text-xs text-gray-500">{a.time_slot}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {a.services?.title ?? '—'}
                  </td>
                  <td className="py-3 px-4">
                    <a href={`tel:${a.phone}`} className="text-chm-red hover:underline font-medium whitespace-nowrap">
                      {a.phone}
                    </a>
                    {a.email && <p className="text-xs text-gray-500 mt-0.5">{a.email}</p>}
                  </td>
                  <td className="py-3 px-4 max-w-[200px]">
                    {a.notes
                      ? <p className="text-xs text-gray-500 leading-relaxed">{a.notes}</p>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="py-3 px-4">
                    <AppointmentStatusButton id={a.id} initialStatus={a.status} />
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
