'use client'

import { useState } from 'react'

type OfferLetter = {
  id: string
  position: string
  salary_annual: number
  start_date: string
  benefits_summary: string | null
  pdf_url: string | null
  created_at: string
}

export default function ViewOfferLetterModal({
  offer,
  applicantName,
}: {
  offer: OfferLetter
  applicantName: string
}) {
  const [open, setOpen] = useState(false)

  const startDateFormatted = new Date(offer.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const createdDateFormatted = new Date(offer.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-chm-black hover:underline font-semibold"
      >
        View Offer
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-serif text-2xl text-chm-black">Offer Letter</h2>
                <p className="text-sm text-gray-500">{applicantName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-chm-black text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="text-xs text-gray-500">Sent: {createdDateFormatted}</p>
              
              <h3>POSITION DETAILS</h3>
              <ul>
                <li><strong>Position:</strong> {offer.position}</li>
                <li><strong>Start Date:</strong> {startDateFormatted}</li>
                <li><strong>Hourly Rate:</strong> ${offer.salary_annual}/hour</li>
              </ul>

              {offer.benefits_summary && (
                <>
                  <h3>ADDITIONAL BENEFITS</h3>
                  <p>{offer.benefits_summary}</p>
                </>
              )}

              <p className="text-xs text-gray-500 mt-8">ID: {offer.id}</p>

              {offer.pdf_url && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  
                    href={offer.pdf_url}
                    download
                    className="inline-block bg-chm-red text-white px-4 py-2 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
                  >
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
