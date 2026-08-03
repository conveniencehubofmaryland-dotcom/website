import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import StaffRecordsTableClient from '@/components/StaffRecordsTableClient'

interface StaffRecord {
  id: string
  full_name: string
  email: string
  phone: string
  sex: string
  date_of_birth: string
  position: string
  years_of_experience: number
  acknowledged_1099: boolean
  onboarding_status: string
  created_at: string
  no_show_count: number
  notes?: string | null
}

export default async function StaffRecordsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const records = await dbSelectAuth<StaffRecord>('offer_letter_applicants', token, {
    order: 'created_at.desc'
  })

  return (
    <div className="space-y-8">
      <div>
        <div className="w-12 h-px bg-chm-red mb-4" />
        <h1 className="font-serif text-4xl text-chm-black mb-2">Staff Records</h1>
        <p className="text-gray-600">Manage all onboarded candidates and their information</p>
      </div>

      <StaffRecordsTableClient initialRecords={records} />
    </div>
  )
}
