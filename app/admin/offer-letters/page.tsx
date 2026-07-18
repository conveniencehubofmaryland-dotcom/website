import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import { POSITION_LIST, PAY_STRUCTURE } from '@/lib/pay-structure'
import OfferLetterClient from '@/components/OfferLetterClient'

console.log('[admin/offer-letters] Page rendering')

type Applicant = {
  id: string
  full_name: string
  email: string
  phone: string
  position: string
  address: string | null
  status: 'draft' | 'sent' | 'signed'
  created_at: string
}

console.log('[admin/offer-letters] Token:', token ? 'present' : 'missing')
console.log('[admin/offer-letters] Applicants found:', applicants.length)

export default async function AdminOfferLettersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const applicants = await dbSelectAuth<Applicant>('offer_letter_applicants', token, {
    select: '*',
    order: 'created_at.desc',
  })

  // Group by position
  const grouped: Record<string, Applicant[]> = {}
  POSITION_LIST.forEach(pos => {
    grouped[pos] = applicants.filter(a => a.position === pos)
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Offer Letters</h1>
        <p className="text-sm text-gray-500 mt-1">{applicants.length} applicant{applicants.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-10">
        {POSITION_LIST.map(position => {
          const positionApplicants = grouped[position]
          if (!positionApplicants.length) return null

          return (
            <div key={position}>
              <h2 className="font-semibold text-lg text-chm-black mb-4 pb-2 border-b border-gray-200">{position}</h2>

              {/* Pay Tier Reference */}
              <div className="bg-gray-50 p-4 rounded mb-6 text-xs">
                <p className="text-gray-600 font-semibold mb-2">Pay Tiers:</p>
                <div className="space-y-1">
                  {PAY_STRUCTURE[position]?.tiers.map(tier => (
                    <div key={tier.level} className="flex justify-between text-gray-700">
                      <span>{tier.level}</span>
                      <span className="font-semibold">${tier.hourly_min.toFixed(2)}–${tier.hourly_max.toFixed(2)}/hr ({tier.monthly_min.toLocaleString()}–${tier.monthly_max.toLocaleString()}/mo)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applicants Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0 mb-8">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      {['Name', 'Email', 'Phone', 'Status', 'Applied', 'Action'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {positionApplicants.map(applicant => (
                      <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-chm-black">{applicant.full_name}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{applicant.email}</td>
                        <td className="py-3 px-4 text-gray-600">{applicant.phone}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block text-xs px-2 py-1 rounded font-semibold ${
                            applicant.status === 'signed'
                              ? 'bg-green-100 text-green-700'
                              : applicant.status === 'sent'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {applicant.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {new Date(applicant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <OfferLetterClient
                            applicantId={applicant.id}
                            applicantName={applicant.full_name}
                            position={applicant.position}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      {applicants.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No applicants yet.</p>
        </div>
      )}
    </div>
  )
}
