import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import StaffRecordsTable from './StaffRecordsTable'
import { DeleteButton } from './DeleteButton'

type Progress = {
  id: string
  staff_name: string
  staff_email: string
  staff_phone: string | null
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

type OfferLetter = {
  id: string
  applicant_id: string
  position: string
  status: string
  created_at: string
  signed_at: string | null
  offer_letter_applicants: {
    full_name: string
    email: string
  }
}

export default async function AdminAnalyticsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const progress = await dbSelectAuth<Progress>('staff_module_progress', token)
  const modules = await dbSelectAuth<ModuleRow>('training_modules', token)
  const offerLetters = await dbSelectAuth<OfferLetter>('offer_letters', token, {
    select: 'id,applicant_id,position,status,created_at,signed_at,offer_letter_applicants(full_name,email)'
  })

  // Calculations
  const totalAttempts = progress.length
  const completed = progress.filter(p => p.status === 'completed').length
  const failed = progress.filter(p => p.status === 'failed').length
  const inProgress = progress.filter(p => p.status === 'in_progress').length
  const passRate = totalAttempts > 0 ? Math.round((completed / totalAttempts) * 100) : 0
  const uniqueStaff = new Set(progress.map(p => p.staff_email)).size

  const scoredAttempts = progress.filter(p => p.quiz_score !== null)
  const avgScore = scoredAttempts.length > 0
    ? Math.round(scoredAttempts.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / scoredAttempts.length)
    : 0

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

  const merged = progress
    .map(p => {
      const moduleData = modules.find(m => m.id === p.module_id)
      return { ...p, module_title: moduleData?.title || 'Unknown Module' }
    })
    .sort((a, b) => {
      const aDate = a.completed_at ? new Date(a.completed_at).getTime() : 0
      const bDate = b.completed_at ? new Date(b.completed_at).getTime() : 0
      return bDate - aDate
    })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Analytics Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of offer letters and staff training performance</p>
      </div>

      {/* ===== OFFER LETTERS SECTION ===== */}
      <div className="mb-16 pb-12 border-b-2 border-gray-200">
        <h2 className="font-serif text-2xl text-chm-black mb-6">Offer Letters</h2>

        {/* Offer Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {(() => {
            const total = offerLetters.length
            const draft = offerLetters.filter(o => o.status === 'draft').length
            const sent = offerLetters.filter(o => o.status === 'sent').length
            const signed = offerLetters.filter(o => o.status === 'signed').length
            const pending = sent + draft
            const acceptanceRate = sent > 0 ? Math.round((signed / sent) * 100) : 0

            return (
              <>
                <div className="border border-gray-200 p-5">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Total Offers</p>
                  <p className="text-3xl font-bold text-chm-black">{total}</p>
                </div>
                <div className="border border-gray-200 p-5">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{pending}</p>
                </div>
                <div className="border border-gray-200 p-5">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Signed</p>
                  <p className="text-3xl font-bold text-green-600">{signed}</p>
                </div>
                <div className="border border-gray-200 p-5">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Acceptance Rate</p>
                  <p className="text-3xl font-bold text-chm-red">{acceptanceRate}%</p>
                </div>
                <div className="border border-gray-200 p-5">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Draft</p>
                  <p className="text-3xl font-bold text-gray-500">{draft}</p>
                </div>
              </>
            )
          })()}
        </div>

        {/* Recent Offers Table */}
        {offerLetters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Applicant</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Position</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Created</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Signed</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {offerLetters
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 10)
                  .map((offer) => (
                    <tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold text-chm-black">{offer.offer_letter_applicants?.full_name || 'Unknown'}</td>
                      <td className="py-3 px-4 text-gray-600 text-xs">{offer.position}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded ${
                          offer.status === 'signed' ? 'bg-green-100 text-green-700' :
                          offer.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          offer.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{new Date(offer.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{offer.signed_at ? new Date(offer.signed_at).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-4">
                        <DeleteButton table="offer_letters" id={offer.id} name={offer.offer_letter_applicants?.full_name || 'Offer'} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No offer letters yet.</p>
        )}
      </div>

      {/* ===== TRAINING ANALYTICS SECTION ===== */}
      <div>
        <h2 className="font-serif text-2xl text-chm-black mb-6">Training Analytics & Certifications</h2>

        {/* Training Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
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
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">In Progress</p>
            <p className="text-3xl font-bold text-gray-400">{inProgress}</p>
          </div>
          <div className="border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Pass Rate</p>
            <p className="text-3xl font-bold text-chm-red">{passRate}%</p>
          </div>
          <div className="border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Avg Score</p>
            <p className="text-3xl font-bold text-chm-red">{avgScore}%</p>
          </div>
        </div>

        {/* By Module */}
        <div className="mb-12 pb-12 border-b border-gray-200">
          <h3 className="font-serif text-xl text-chm-black mb-4">By Module</h3>
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
        <div className="mb-12 pb-12 border-b border-gray-200">
          <h3 className="font-serif text-xl text-chm-black mb-4">By Position</h3>
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

        {/* All Staff Records */}
        <div>
          <h3 className="font-serif text-xl text-chm-black mb-4">All Staff Records</h3>
          <StaffRecordsTable records={merged} deleteButton={DeleteButton} />
        </div>
      </div>
    </div>
  )
}
