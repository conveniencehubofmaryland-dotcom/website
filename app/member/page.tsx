import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionMember } from '@/lib/member-session'
import { sbFetch } from '@/lib/shift-eligibility'
import { TIERS, tierOf } from '@/lib/membership-tiers'
import MemberLogoutButton from '@/components/MemberLogoutButton'

type Booking = { appointment_date: string; time_slot: string | null; status: string; quoted_total: number | null }

export default async function MemberPortalPage() {
  const member = await getSessionMember()
  if (!member) redirect('/member/login')

  const tier = tierOf(member.tier)
  const info = TIERS[tier]

  let bookings: Booking[] = []
  try {
    const res = await sbFetch(
      `appointments?email=ilike.${encodeURIComponent(member.email)}&select=appointment_date,time_slot,status,quoted_total&order=appointment_date.desc&limit=20`
    )
    if (res.ok) bookings = (await res.json()) as Booking[]
  } catch {
    bookings = []
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-chm-red font-semibold">Member portal</p>
          <h1 className="font-serif text-3xl text-chm-black mt-2">Welcome, {member.name.split(' ')[0]}</h1>
        </div>
        <MemberLogoutButton />
      </div>

      <section className="mt-8 border border-gray-200 p-6">
        <p className="text-xs uppercase tracking-widest text-gray-500">Your membership</p>
        <p className="font-serif text-2xl text-chm-black mt-1">{info.name}</p>
        <p className="text-sm text-gray-600 mt-1">{info.price}</p>
        <p className="text-lg font-semibold text-chm-red mt-4">{info.discountPercent}% off all services</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700 list-disc pl-5">
          {info.benefits.map(b => <li key={b}>{b}</li>)}
        </ul>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Your bookings</h2>
          <Link href="/book" className="bg-chm-red text-white px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-700">
            Book a service
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400 mt-4">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  {['Date', 'Time', 'Status', 'Quoted total'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 px-4">{b.appointment_date}</td>
                    <td className="py-3 px-4">{b.time_slot ?? '—'}</td>
                    <td className="py-3 px-4 capitalize">{b.status}</td>
                    <td className="py-3 px-4">{b.quoted_total != null ? `$${Number(b.quoted_total).toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
