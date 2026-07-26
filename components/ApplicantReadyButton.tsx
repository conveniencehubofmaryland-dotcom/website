'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplicantReadyButton({
  applicantId,
  onboarding_status,
}: {
  applicantId: string
  onboarding_status: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isReady = onboarding_status === 'ready_to_claim_shifts'

  async function markReady() {
    if (!confirm('Mark this applicant as ready to claim shifts? They will immediately have access to the shift portal.')) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/applicants/mark-ready', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: applicantId }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to mark as ready')
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Error marking as ready')
    } finally {
      setLoading(false)
    }
  }

  if (isReady) {
    return (
      <span className="text-xs px-2 py-0.5 border border-green-200 bg-green-50 text-green-700 font-semibold rounded-sm">
        ✓ Ready
      </span>
    )
  }

  return (
    <button
      disabled={loading || onboarding_status !== 'offer_signed'}
      onClick={markReady}
      title={onboarding_status !== 'offer_signed' ? 'Applicant must sign offer first' : ''}
      className="text-xs text-green-700 hover:underline underline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
    >
      Mark Ready
    </button>
  )
}
