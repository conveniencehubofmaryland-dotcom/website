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

async function getApplicant(id: string, token: string) {
  const applicants = await dbSelectAuth<Applicant>(
    'offer_letter_applicants',
    token,
    {
      select: '*',
    }
  )
  return applicants.find(a => a.id === id)
}

export default async function SignedDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const applicant = await getApplicant(id, token)

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

Our Service Lines
CHM is a comprehensive concierge and home management company. You may be assigned to one or more of the following service lines:

  1. Cleaning & Estate Care
  2. Laundry Pickup & Delivery
  3. Meal Prep
  4. Nanny & Childcare
  5. Elder & Companion Care
  6. Commercial Cleaning
  7. Special Project / Event Support


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. EMPLOYMENT BASICS

How Shifts Work
  • All shifts are posted in the Claim Shift Portal
  • You must actively claim and confirm your shifts through the portal
  • Assignments range from a few hours to full-day projects

Timekeeping & Attendance
  • Be punctual. Arrive at least 15 minutes before your scheduled shift
  • If you will be late or unable to make a shift, notify your supervisor at least 2 hours in advance
  • No call/no show may result in immediate disciplinary action

Pay Schedule & Compensation
  • You are paid every week (typically Fridays) for work completed in the prior week
  • Your pay rate is based on your position, experience level, and certifications
  • Overtime must be pre-approved by your supervisor


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. POLICIES & CONDUCT

Professionalism & Respect
  • Treat clients, families, and co-workers with dignity and respect at all times
  • Provide excellent customer service – you represent CHM in every interaction
  • Maintain professional boundaries with clients

Zero Tolerance Policy
CHM maintains a zero-tolerance policy for:
  • Discrimination or harassment of any kind
  • Violence, threats, or abusive language
  • Theft or unauthorized use of client/company property
  • Neglect or abuse of clients
  • Substance abuse or being under the influence at work

Client Confidentiality
This is CRITICAL. You will have access to private client information.

You must NEVER:
  • Share client photos, names, addresses, or personal information on social media
  • Discuss clients outside of professional work settings
  • Post about your work or clients on personal social media accounts
  • Share client information via personal devices
  • Leave client information unsecured

NO SOLICITATION POLICY
Staff shall not solicit, accept, or perform work for any CHM client outside of an official CHM contract. This is strictly prohibited for the duration of employment AND for 24 months after separation from CHM.

Violation of this policy may result in legal action and liquidated damages.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. STAFF TRANSPORTATION POLICY

Reliable Personal Vehicle Required
All active staff members must own, lease, or have consistent access to a reliable personal motor vehicle. Public transit or rideshare apps alone are generally insufficient due to multi-location scheduling demands.

Multi-Shift Days & Different Locations
Because claimed shifts are often located in different neighborhoods across Maryland, Virginia, and the D.C. metro area, you may be scheduled to work multiple shifts in different locations throughout the day.

Punctuality & Attendance Expectations
Staff are required to arrive at every claimed shift location promptly at the scheduled start time. Zero tolerance for transit delays. If you claim a shift, you must be able to meet that commitment.

Mileage Reimbursement
CHM reimburses mileage at the rate of $0.56 per mile for travel between claimed shifts and for service-related mileage.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. TRAINING & DEVELOPMENT

Required Orientation & Training
Before your first shift, you must complete:
  1. This Orientation Document
  2. Acknowledgment of this document
  3. Required Training Modules
  4. Certification verification

Training Portal Access
  • Modules are self-paced and typically take 1-3 hours
  • You must pass each module with a score of 80% or higher
  • Modules must be completed before your first assignment

Ongoing Development
  • CHM is committed to your professional development
  • Career advancement is available for reliable, high-performing employees
  • We support ongoing certifications


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. FIRST DAY DETAILS

Documents You Must Bring
  • Valid government-issued photo ID
  • Social Security number (for W-4 and tax purposes)
  • Proof of eligibility to work in the U.S. (I-9 documents)
  • Direct deposit information
  • Any professional certifications

What to Expect
  • You'll receive your CHM ID badge and employee handbook
  • System access will be set up
  • You'll meet your team and receive workspace orientation
  • Your first assignment or schedule will be confirmed


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. CONTACT INFORMATION & SUPPORT

HR & Administration
  Email: conveniencehubofmaryland@gmail.com
  Phone: 202-579-2944
  Hours: Monday–Saturday, 9 AM–9 PM


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MEMORANDUM OF UNDERSTANDING
CLIENT NON-SOLICITATION & CONFIDENTIALITY AGREEMENT

Purpose
CHM provides comprehensive client-based concierge and home management services. To protect clients, maintain business operations, and ensure fair compensation, all Staff must comply with these terms.

NON-SOLICITATION & OUTSIDE WORK PROHIBITION

Staff shall not, directly or indirectly:

  1. Solicit, accept, or perform work for any CHM client outside of an official CHM contract, including as a side deal, private arrangement, or under a different entity name.

  2. Engage in private dealings with any CHM client for services that CHM offers, for the duration of employment AND for 24 months after separation.

  3. Share CHM client contact details with any third party for personal gain without CHM's prior written consent.

BREACH REMEDIES & CONSEQUENCES

Violation of the non-solicitation agreement is a material breach. If a breach occurs, Staff agrees to:

1. PAY LIQUIDATED DAMAGES OF $30,000.00 TO CHM
   - This represents CHM's estimated loss from the breach
   - This obligation is separate from CHM's other remedies

2. FACE LEGAL ACTION FOR:
   - Injunctive relief
   - Recovery of all damages, costs, and attorney fees
   - Any additional damages CHM can prove

3. AUTOMATIC TERMINATION
   - Engagement will be terminated immediately upon confirmation of breach
   - Termination does not waive the $30,000 obligation

CONFIDENTIALITY

Staff shall keep all CHM information strictly confidential at all times, including:
  • Client lists, names, addresses, phone numbers, and contact information
  • Client service history, preferences, and personal details
  • Pricing structures, rates, service contracts, and discounts
  • Business strategies, marketing plans, and operational procedures
  • Financial information, payroll, wages, and compensation details

Confidentiality obligations survive termination indefinitely.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPLOYEE ACKNOWLEDGMENT

By signing below, I acknowledge that I have read, understood, and agree to comply with all terms outlined in this Orientation Document and Memorandum of Understanding. I understand that violation of these terms may result in disciplinary action, termination, and/or legal action.

I specifically acknowledge:
  • I have received and reviewed this complete orientation document
  • I understand the non-solicitation policy and $30,000 liquidated damages clause
  • I understand the confidentiality requirements
  • I understand the transportation requirements for shift scheduling
  • I agree to comply with all CHM policies and procedures
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
            <p className="text-xs text-gray-600">
              <strong>Signed:</strong> {signedDate}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>By:</strong> {applicant.full_name}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Position:</strong> {applicant.position}
            </p>
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
          body {
            background: white;
          }
          .mb-6, .space-y-2, button:not(.printable-content *) {
            display: none;
          }
          .printable-content {
            box-shadow: none;
            page-break-after: always;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  )
}
