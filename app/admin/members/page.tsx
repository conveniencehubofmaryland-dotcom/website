import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import type { Member } from '@/lib/types'
import MemberActions from '@/components/MemberActions'

const STATE_LABELS: Record<string, string> = { MD: 'Maryland', VA: 'Virginia', DC: 'D.C.' }

export default async function AdminMembersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const members = await dbSelectAuth<Member>('members', token, {
    select: '*',
    order:  'created_at.desc',
  })

  const activeCount = members.filter(m => m.active).length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-chm-black">Members</h1>
          {members.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">{activeCount} active · {members.length - activeCount} pending · {members.length} total</p>
          )}
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No members yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                {['Member', 'Contact', 'Location', 'Services', 'Frequency', 'Joined', 'Status'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className={`border-b border-gray-100 hover:bg-gray-50 ${!m.active ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-chm-black whitespace-nowrap">{m.name}</p>
                    {m.address && <p className="text-xs text-gray-400 mt-0.5">{m.address}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <a href={`tel:${m.phone}`} className="text-chm-red hover:underline font-medium whitespace-nowrap">{m.phone}</a>
                    <p className="text-xs text-gray-500 mt-0.5">{m.email}</p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                    {STATE_LABELS[m.state] ?? m.state}
                  </td>
                  <td className="py-3 px-4 max-w-[180px]">
                    {m.preferred_services?.length
                      ? <p className="text-xs text-gray-500 leading-relaxed">{m.preferred_services.join(', ')}</p>
                      : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-gray-600 text-xs">
                    {m.service_frequency ?? '—'}
                    {m.recurring && <span className="ml-1 text-chm-red">↻</span>}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-400">
                    {new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <MemberActions id={m.id} active={m.active} />
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
