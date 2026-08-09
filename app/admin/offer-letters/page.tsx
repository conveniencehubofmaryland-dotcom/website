import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import { POSITION_LIST } from '@/lib/pay-structure'
import OfferLettersClient from '@/components/OfferLettersClient'

type Applicant = {
  id: string
  full_name: string
  email: string
  phone: string
  position: string
  address: string | null
  status: 'draft' | 'sent' | 'signed' | 'expired'
  onboarding_status: string
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

  const offerMap = new Map(offers.map(o => [o.applicant_id, o]))

  console.log('[offer-letters] filterStatus:', filterStatus)
  console.log('[offer-letters] applicants:', applicants.length)

  const filtered =
    filterStatus === 'all'
      ? applicants
      : filterStatus === 'new'
      ? applicants.filter(a => a.onboarding_status === 'new')
      : filterStatus === 'ready'
      ? applicants.filter(a => a.onboarding_status === 'ready_to_claim_shifts')
      : applicants.filter(a => a.status === filterStatus)

  console.log('[offer-letters] filtered:', filtered.length)

  const grouped: Record<string, Applicant[]> = {}
  POSITION_LIST.forEach(pos => {
    grouped[pos] = filtered.filter(a => a.position === pos)
  })

  const pendingPositionApplicants = filtered.filter(a => a.position === 'Pending')

  return (
    <OfferLettersClient
      grouped={grouped}
      filtered={filtered}
      offerMap={offerMap}
      pendingApplicants={pendingPositionApplicants}
    />
  )
}
