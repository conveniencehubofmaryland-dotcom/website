'use client'

import { useState } from 'react'
import OfferLetterModal from '@/components/OfferLetterModal'

type Props = {
  applicantId: string
  applicantName: string
  position: string
}

export default function OfferLetterClient({ applicantId, applicantName, position }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-chm-red hover:underline font-semibold"
      >
        Create Offer
      </button>
      {showModal && (
        <OfferLetterModal
          applicantId={applicantId}
          applicantName={applicantName}
          position={position}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
