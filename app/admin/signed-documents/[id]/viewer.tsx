'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Applicant = {
  id: string
  full_name: string
  email: string
  phone: string
  position: string
  address: string | null
  orientation_accepted_at: string
  full_signature: string | null
}

export default function DocumentViewer({ docId }: { docId: string }) {
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        console.log('[viewer] Fetching document:', docId)
        const res = await fetch(`/api/admin/signed-documents/${docId}`)
        
        console.log('[viewer] Response status:', res.status)

        if (!res.ok) {
          throw new Error('Document not found')
        }

        const data = await res.json()
        console.log('[viewer] Document loaded:', data.full_name)
        setApplicant(data)
      } catch (err) {
        console.error('[viewer] Error:', err)
        setError('Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [docId])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading document...</div>
  }

  if (error || !applicant) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-600 text-lg">Document not found or not signed.</p>
        <Link href="/admin/signed-documents" className="text-chm-red hover:underline mt-4 inline-block">
          Back to Signed Documents
        </Link>
      </div>
    )
  }

  const signedDate = new Date(applicant.orientation_accepted_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div>
      <div className="mb-8 border-b-2 border-gray-300 pb-8">
        <h2 className="font-bold text-lg mb-4">EMPLOYEE INFORMATION</h2>
        <p className="text-sm mb-2"><strong>Name:</strong> {applicant.full_name}</p>
        <p className="text-sm mb-2"><strong>Position:</strong> {applicant.position}</p>
        <p className="text-sm mb-2"><strong>Email:</strong> {applicant.email}</p>
        <p className="text-sm mb-2"><strong>Phone:</strong> {applicant.phone}</p>
        <p className="text-sm mb-2"><strong>Address:</strong> {applicant.address || 'Not provided'}</p>
        <p className="text-sm"><strong>Date Signed:</strong> {signedDate}</p>
      </div>

      <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 mb-8">
{`CONVENIENCE HUB OF MARYLAND
New Employee Orientation Document & Memorandum of Understanding

EMPLOYEE ACKNOWLEDGMENT

By signing this document, I acknowledge that I have read, understood, and agree to comply with all terms outlined in this Orientation Document and Memorandum of Understanding.

I specifically acknowledge:
- I have received and reviewed the complete orientation document
- I understand the non-solicitation policy and $30,000 liquidated damages clause
- I understand the confidentiality requirements
- I understand the transportation requirements for shift scheduling
- I agree to comply with all CHM policies and procedures
`}
      </div>

      {applicant.full_signature && (
        <div className="mt-16 pt-8 border-t-2 border-gray-300">
          <h3 className="font-bold text-sm mb-4">EMPLOYEE SIGNATURE</h3>
          <div className="mb-6">
            <img
              src={applicant.full_signature}
              alt="Signature"
              style={{ maxWidth: '300px', maxHeight: '120px' }}
            />
          </div>
          <p className="text-xs text-gray-600"><strong>Signed:</strong> {signedDate}</p>
          <p className="text-xs text-gray-600 mt-2"><strong>By:</strong> {applicant.full_name}</p>
          <p className="text-xs text-gray-600 mt-2"><strong>Position:</strong> {applicant.position}</p>
        </div>
      )}

      <div className="mt-16 pt-8 border-t-2 border-gray-300 text-center text-xs text-gray-500">
        <p>This document was electronically signed and accepted on {signedDate}</p>
        <p>Convenience Hub of Maryland • 202-579-2944</p>
        <p className="mt-4 text-gray-400">Record ID: {applicant.id}</p>
      </div>
    </div>
  )
}
