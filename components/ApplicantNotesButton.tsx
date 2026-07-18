'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplicantNotesButton({
  applicantId,
  initialNotes,
}: {
  applicantId: string
  initialNotes: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(initialNotes || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/offer-letters/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicant_id: applicantId, notes }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => {
          setSaved(false)
          setOpen(false)
          router.refresh()
        }, 1500)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-500 hover:text-chm-black hover:underline font-semibold"
      >
        {initialNotes ? 'View Notes' : 'Add Notes'}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-chm-black">Applicant Notes</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-chm-black text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 px-4 py-3 text-sm text-chm-black focus:outline-none focus:border-chm-red transition-colors resize-none"
              placeholder="Add internal notes about this applicant..."
            />

            {saved && <p className="text-green-700 text-xs mt-2">Saved!</p>}

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-chm-red text-white py-2 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-60 mt-4"
            >
              {loading ? 'Saving…' : 'Save Notes'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
