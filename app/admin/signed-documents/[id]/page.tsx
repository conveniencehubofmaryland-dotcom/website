import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
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

export const metadata = {
  title: 'Signed Document | CHM Admin',
}

export default async function SignedDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  try {
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

    let applicants: Applicant[] = []
    try {
      applicants = await dbSelectAuth<Applicant>(
        'offer_letter_applicants',
        token,
        { select: '*' }
      )
    } catch (err) {
      console.error('Database error:', err)
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600 text-lg">Database connection error.</p>
          <Link href="/admin/signed-documents" className="text-chm-red hover:underline mt-4 inline-block">
            Back to Documents
          </Link>
        </div>
      )
    }

    const applicant = applicants.find(a => a.id === id)

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. COMPANY INFORMATION

Welcome to the CHM Team

Welcome to Convenience Hub of Maryland! We're thrilled to have you join our growing team of professionals dedicated to making everyday life more convenient, comfortable, and caring for the clients and families we serve across Maryland, Virginia, and Washington D.C.

Our Mission
To provide reliable, compassionate, and convenient support services that enhance the quality of life for our clients across Maryland, Virginia, and Washington D.C.

Our Vision
To be the most trusted comprehensive concierge and home management company in the Mid-Atlantic region.

Our Core Values
  • C – Compassion: We lead with care in every interaction with clients, families, and colleagues.
  • H – Honesty: We do what's right, even when no one is watching. Integrity guides our decisions.
  • M – Mindfulness: We are attentive, respectful, and dependable in every task we undertake.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. EMPLOYMENT BASICS

Timekeeping & Attendance
  • Be punctual. Arrive at least 15 minutes before your scheduled shift
  • If you will be late or unable to make a shift, notify your supervisor at least 2 hours in advance

Pay Schedule & Compensation
  • You are paid every week (typically Fridays) for work completed in the prior week
  • Your pay rate is based on your position, experience level, and certifications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. POLICIES & CONDUCT

Professionalism & Respect
  • Treat clients, families, and co-workers with dignity and respect

Zero Tolerance Policy
CHM maintains a zero-tolerance policy for discrimination, harassment, violence, or substance abuse.

Client Confidentiality
You will have access to private client information. You must NEVER share client information on social media or with unauthorized parties.

NO SOLICITATION POLICY
Staff shall not solicit, accept, or perform work for any CHM client outside of an official CHM contract for the duration of employment AND for 24 months after separation.

Violation may result in legal action and liquidated damages.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MEMORANDUM OF UNDERSTANDING
CLIENT NON-SOLICITATION & CONFIDENTIALITY AGREEMENT

NON-SOLICITATION & OUTSIDE WORK PROHIBITION

Staff shall not, directly or indirectly:
  1. Solicit, accept, or perform work for any CHM client outside of an official CHM contract
  2. Engage in private dealings with any CHM client for services that CHM offers, for 24 months after separation
  3. Share CHM client contact details with any third party for personal gain

BREACH REMEDIES & CONSEQUENCES

Violation of the non-solicitation agreement is a material breach.

1. PAY LIQUIDATED DAMAGES OF $30,000.00 TO CHM
2. FACE LEGAL ACTION FOR injunctive relief and recovery of damages
3. AUTOMATIC TERMINATION

CONFIDENTIALITY

Staff shall keep all CHM information strictly confidential indefinitely.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPLOYEE ACKNOWLEDGMENT

By signing below, I acknowledge that I have read, understood, and agree to comply with all terms outlined in this Orientation Document and Memorandum of Understanding.
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
  } catch (error) {
    console.error('Signed document page error:', error)
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-600 text-lg">An unexpected error occurred.</p>
        <p className="text-gray-600 text-sm mt-2">Please try again or contact support.</p>
        <Link href="/admin/signed-documents" className="text-chm-red hover:underline mt-4 inline-block">
          Back to Documents
        </Link>
      </div>
    )
  }
}
