import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import { POSITION_LIST, PAY_STRUCTURE } from '@/lib/pay-structure'
import OfferLetterClient from '@/components/OfferLetterClient'
import ApplicantStatusButton from '@/components/ApplicantStatusButton'
import ViewOfferLetterModal from '@/components/ViewOfferLetterModal'
import ApplicantNotesButton from '@/components/ApplicantNotesButton'
import StatusFilter from './StatusFilter'
import { DeleteButton } from '@/components/DeleteButton'

type Applicant = {
  id: string
  full_name: string
  email: string
  phone: string
  position: string
  address: string | null
  status: 'draft' | 'sent' | 'signed' | 'expired'
  notes: string | null
  created_at: string
}

type OfferLetter = {
  id: string
  applicant_id: string
  position: string
  salary_annual: number
  start_date: string
  benefits_summary: string | null
  pdf_url: string | null
  created_at: string
}

export default async function AdminOfferLettersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus = 'all' } = await searchParams
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const applicants = await dbSelectAuth<Applicant>('offer_letter_applicants', token, {
    select: '*',
    order: 'created_at.desc',
  })

  const offers = await dbSelectAuth<OfferLetter>('offer_letters', token, {
    select: '*',
  })

  // Create a map of applicant_id -> offer for quick lookup
  const offerMap = new Map(offers.map(o => [o.applicant_id, o]))

  // Filter by status
  const filtered = filterStatus === 'all' 
    ? applicants 
    : applicants.filter(a => a.status === filterStatus)

  // Group by position
  const grouped: Record<string, Applicant[]> = {}
  POSITION_LIST.forEach(pos => {
    grouped[pos] = filtered.filter(a => a.position === pos)
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-chm-black">Offer Letters</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} applicant{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        
        <StatusFilter />
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
                      {['Name', 'Email', 'Phone', 'Status', 'Notes', 'Applied', 'Action', 'Delete'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {positionApplicants.map(applicant => {
                      const offer = offerMap.get(applicant.id)
                      return (
                        <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-chm-black">{applicant.full_name}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{applicant.email}</td>
                          <td className="py-3 px-4 text-gray-600">{applicant.phone}</td>
                          <td className="py-3 px-4">
                            <ApplicantStatusButton applicantId={applicant.id} initialStatus={applicant.status} />
                          </td>
                          <td className="py-3 px-4">
                            <ApplicantNotesButton applicantId={applicant.id} initialNotes={applicant.notes} />
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">
                            {new Date(applicant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 space-y-1">
                            {offer ? (
                              <ViewOfferLetterModal offer={offer} applicantName={applicant.full_name} />
                            ) : (
                              <OfferLetterClient
                                applicantId={applicant.id}
                                applicantName={applicant.full_name}
                                position={applicant.position}
                              />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <DeleteButton 
                              table="offer_letter_applicants" 
                              id={applicant.id} 
                              name={applicant.full_name}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No applicants found.</p>
        </div>
      )}
    </div>
  )
}
