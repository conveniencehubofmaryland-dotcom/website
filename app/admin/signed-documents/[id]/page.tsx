import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'

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

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Signed Document | CHM Admin',
  }
}

async function fetchApplicant(id: string, token: string): Promise<Applicant | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/offer_letter_applicants?id=eq.${id}`
    
    const res = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    })

    if (!res.ok) {
      console.error('[signed-doc] Fetch failed:', res.status)
      return null
    }

    const data: Applicant[] = await res.json()
    return data.length > 0 ? data[0] : null
  } catch (err) {
    console.error('[signed-doc] Fetch error:', err)
    return null
  }
}

export default async function SignedDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  if (!token) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-600 text-lg">Admin authentication required.</p>
        <Link href="/admin/login" className="text-chm-red hover:underline mt-4 inline-block">
          Back to Login
        </Link>
      </div>
    )
  }

  const applicant = await fetchApplicant(id, token)

  if (!applicant || !applicant.orientation_accepted_at) {
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-chm-black">Signed Document Record</h1>
          <p className="text-sm text-gray-500 mt-1">{applicant.full_name} • {applicant.position}</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => window.print()}
            className="block w-full bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
          >
            🖨️ Print to PDF
          </button>
          <Link
            href="/admin/signed-documents"
            className="block w-full bg-gray-200 text-gray-700 px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors text-center"
          >
            Back
          </Link>
        </div>
      </div>

      <div className="bg-white p-12 shadow-sm printable-content" style={{ fontFamily: 'Georgia, serif' }}>
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

      <style>{`
        @media print {
          body { background: white; }
          .mb-6, .space-y-2, button:not(.printable-content *) { display: none; }
          .printable-content { box-shadow: none; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  )
}
