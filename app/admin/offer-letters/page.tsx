'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import SendInviteModal from '@/components/SendInviteModal'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Applicant {
  id: string
  full_name: string
  email: string
  phone: string
  position: string
  onboarding_status: string
  created_at: string
}

export default function OfferLettersPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('offer_letter_applicants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplicants(data || [])
    } catch (err) {
      console.error('Failed to fetch applicants:', err)
    } finally {
      setLoading(false)
    }
  }

  const openInviteModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant)
    setShowInviteModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading applicants…</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="w-12 h-px bg-chm-red mb-4" />
        <h1 className="font-serif text-4xl text-chm-black mb-2">Offer Letters</h1>
        <p className="text-gray-600">Manage interview results and send onboarding invites</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                Name
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                Email
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                Phone
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                Position
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-gray-600 font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {applicants.map(applicant => (
              <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-chm-black">{applicant.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{applicant.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{applicant.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{applicant.position}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      applicant.onboarding_status === 'profile_submitted'
                        ? 'bg-green-100 text-green-700'
                        : applicant.onboarding_status === 'orientation_completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {applicant.onboarding_status === 'profile_submitted'
                      ? 'Invite Sent'
                      : applicant.onboarding_status === 'orientation_completed'
                      ? 'Onboarded'
                      : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => openInviteModal(applicant)}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded font-semibold text-xs uppercase tracking-widest transition-colors"
                    title="Send onboarding invite link"
                  >
                    Send Invite
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applicants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No applicants yet</p>
        </div>
      )}

      {showInviteModal && selectedApplicant && (
        <SendInviteModal
          applicantId={selectedApplicant.id}
          applicantName={selectedApplicant.full_name}
          applicantEmail={selectedApplicant.email}
          onClose={() => {
            setShowInviteModal(false)
            setSelectedApplicant(null)
          }}
          onSuccess={() => {
            fetchApplicants()
          }}
        />
      )}
    </div>
  )
}
