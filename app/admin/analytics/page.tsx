import { cookies } from 'next/headers'
import Link from 'next/link'
import { dbSelectAuth } from '@/lib/db'

type Progress = {
  id: string
  staff_name: string
  staff_email: string
  position: string | null
  module_id: string
  status: 'in_progress' | 'completed' | 'failed'
  quiz_score: number | null
  completed_at: string | null
}

type ModuleRow = {
  id: string
  title: string
  position: string | null
}

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const progress = await dbSelectAuth<Progress>('staff_module_progress', token)
  const modules = await dbSelectAuth<ModuleRow>('training_modules', token)

  const totalAttempts = progress.length
  const completed = progress.filter(p => p.status === 'completed').length
  const failed = progress.filter(p => p.status === 'failed').length
  const passRate = totalAttempts > 0 ? Math.round((completed / totalAttempts) * 100) : 0

  const uniqueStaff = new Set(progress.map(p => p.staff_email)).size

  const scoredAttempts = progress.filter(p => p.quiz_score !== null)
  const avgScore = scoredAttempts.length > 0
    ? Math.round(scoredAttempts.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / scoredAttempts.length)
    : 0

  // Breakdown by module
  const moduleStats = modules.map(m => {
    const attempts = progress.filter(p => p.module_id === m.id)
    const modCompleted = attempts.filter(p => p.status === 'completed').length
    return {
      title: m.title,
      position: m.position,
      attempts: attempts.length,
      completed: modCompleted,
      passRate: attempts.length > 0 ? Math.round((modCompleted / attempts.length) * 100) : 0,
    }
  })

  // Breakdown by position
  const positionMap = new Map<string, { attempts: number; completed: number }>()
  progress.forEach(p => {
    const pos = p.position || 'Unspecified'
    const existing = positionMap.get(pos) || { attempts: 0, completed: 0 }
    existing.attempts += 1
    if (p.status === 'completed') existing.completed += 1
    positionMap.set(pos, existing)
  })
  const positionStats = Array.from(positionMap.entries()).map(([position, stats]) => ({
    position,
    ...stats,
    passRate: stats.attempts > 0 ? Math.round((stats.completed / stats.attempts) * 100) : 0,
  }))

  // Recent activity, most recent first
  const recent = [...progress]
    .filter(p => p.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 10)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Training Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of staff training performance</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Total Attempts</p>
          <p className="text-3xl font-bold text-chm-black">{totalAttempts}</p>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Staff Trained</p>
          <p className="text-3xl font-bold text-chm-black">{uniqueStaff}</p>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Failed</p>
          <p className="text-3xl font-bold text-red-600">{failed}</p>
        </div>
        <div className="border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Avg Score</p>
          <p className="text-3xl font-bold text-chm-red">{avgScore}%</p>
        </div>
      </div>

      {/* By Module */}
      <div className="mb-12">
        <h2 className="font-serif text-2xl text-chm-black mb-4">By Module</h2>
        {moduleStats.length === 0 ? (
          <p className="text-gray-400 text-sm">No module data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Module</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Position</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Attempts</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Completed</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {moduleStats.map((m, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-chm-black">{m.title}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{m.position || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{m.attempts}</td>
                    <td className="py-3 px-4 text-gray-600">{m.completed}</td>
                    <td className="py-3 px-4 font-semibold text-chm-red">{m.passRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* By Position */}
      <div className="mb-12">
        <h2 className="font-serif text-2xl text-chm-black mb-4">By Position</h2>
        {positionStats.length === 0 ? (
          <p className="text-gray-400 text-sm">No position data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Position</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Attempts</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Completed</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {positionStats.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-chm-black">{p.position}</td>
                    <td className="py-3 px-4 text-gray-600">{p.attempts}</td>
                    <td className="py-3 px-4 text-gray-600">{p.completed}</td>
                    <td className="py-3 px-4 font-semibold text-chm-red">{p.passRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="font-serif text-2xl text-chm-black mb-4">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Score</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-chm-black">{p.staff_name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.quiz_score ?? '—'}%</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 ${
                        p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">
                      {p.completed_at ? new Date(p.completed_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link href="/admin/certifications" className="text-xs text-chm-red hover:underline uppercase tracking-widest">
          ← Back to Certifications
        </Link>
      </div>
    </div>
  )
}
