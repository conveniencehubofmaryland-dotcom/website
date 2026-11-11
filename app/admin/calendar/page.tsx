import Link from 'next/link'
import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { Appointment } from '@/lib/types'

export const dynamic = 'force-dynamic'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-gray-100 text-gray-400 border-gray-200 line-through',
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const now = new Date()
  const parsed = month && /^\d{4}-\d{2}$/.test(month) ? month : `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  const [year, mon] = parsed.split('-').map(Number)

  const first = new Date(year, mon - 1, 1)
  const daysInMonth = new Date(year, mon, 0).getDate()
  const startOffset = first.getDay()
  const firstKey = `${year}-${pad(mon)}-01`
  const lastKey = `${year}-${pad(mon)}-${pad(daysInMonth)}`

  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''
  const appointments = await dbSelectAuth<Appointment>('appointments', token, {
    select: '*,services(id,title,slug)',
    and: `(appointment_date.gte.${firstKey},appointment_date.lte.${lastKey})`,
    order: 'appointment_date.asc,time_slot.asc',
  })

  const byDay: Record<string, Appointment[]> = {}
  for (const a of appointments) {
    const key = String(a.appointment_date).slice(0, 10)
    ;(byDay[key] ||= []).push(a)
  }

  const prev = mon === 1 ? `${year - 1}-12` : `${year}-${pad(mon - 1)}`
  const next = mon === 12 ? `${year + 1}-01` : `${year}-${pad(mon + 1)}`
  const monthName = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>Booking Calendar</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/admin/calendar?month=${prev}`} className="px-3 py-1 border border-gray-200 hover:border-chm-red">← Prev</Link>
          <span className="font-semibold min-w-[160px] text-center">{monthName}</span>
          <Link href={`/admin/calendar?month=${next}`} className="px-3 py-1 border border-gray-200 hover:border-chm-red">Next →</Link>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        <span>■ <span className="text-amber-700">Pending</span></span>
        <span>■ <span className="text-green-700">Confirmed</span></span>
        <span>■ <span className="text-gray-400">Cancelled</span></span>
      </div>

      <div className="grid grid-cols-7 border-t border-l border-gray-200 text-sm">
        {WEEKDAYS.map(d => (
          <div key={d} className="border-r border-b border-gray-200 bg-gray-50 py-2 text-center text-xs uppercase tracking-widest text-gray-500">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="border-r border-b border-gray-200 bg-gray-50/50 min-h-[110px]" />
          const key = `${year}-${pad(mon)}-${pad(day)}`
          const items = byDay[key] || []
          return (
            <div key={key} className="border-r border-b border-gray-200 min-h-[110px] p-1.5">
              <p className="text-xs font-semibold text-gray-500 mb-1">{day}</p>
              <div className="space-y-1">
                {items.map(a => (
                  <Link
                    key={a.id}
                    href={`/admin/schedule?status=all`}
                    className={`block border rounded px-1.5 py-1 text-[11px] leading-tight hover:opacity-80 ${STATUS_STYLE[a.status] || ''}`}
                    title={`${a.customer_name} · ${a.services?.title || ''} · ${a.time_slot}`}
                  >
                    <span className="font-semibold">{a.time_slot}</span> {a.customer_name}
                    {a.services?.title && <span className="block text-[10px] opacity-75 truncate">{a.services.title}</span>}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
