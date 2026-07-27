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

  const ORIENTATION_DOCUMENT = `CONVENIENCE HUB OF MARYLAND
New Employee Orientation Document & Memorandum of Understanding


EMPLOYEE INFORMATION
Name: ${applicant.full_name}
Position: ${applicant.position}
Email: ${applicant.email}
Phone: ${applicant.phone}
Address: ${applicant.address || 'Not provided'}
Date Signed: ${signedDate}


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

  1. Cleaning & Estate Care – Standard, deep, or move-in/move-out cleaning
  2. Laundry Pickup & Delivery – Drop-off, pickup, delivery, or recurring service plans
  3. Meal Prep – Weekly meal preparation plans tailored to client needs
  4. Nanny & Childcare – Full-time, hourly, or specialized childcare services
  5. Elder & Companion Care – Companion care, hourly support, medication reminders, and day programs
  6. Commercial Cleaning – Custom cleaning solutions for businesses
  7. Special Project / Event Support – Custom concierge services for projects and events

Every role is critical. You represent CHM in every interaction.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. EMPLOYMENT BASICS

How Shifts Work
  • All shifts are posted in the Claim Shift Portal at https://conveniencehubofmaryland.com/staff/available-shifts
  • You must actively claim and confirm your shifts through the portal
  • Assignments range from a few hours to full-day projects

Timekeeping & Attendance
  • Be punctual. Arrive at least 15 minutes before your scheduled shift
  • If you will be late or unable to make a shift, notify your supervisor via the Claim Shift app at least 2 hours in advance
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

Dress Code & Professional Appearance
  • Field staff: Clean, professional attire (scrubs or CHM-approved uniform) and closed-toe shoes
  • Office staff: Business casual attire
  • Wear your CHM badge/ID visibly at all times
  • Maintain good personal hygiene

Client Confidentiality (HIPAA Compliance)
This is CRITICAL. You will have access to private client information.

You must NEVER:
  • Share client photos, names, addresses, or personal information on social media
  • Discuss clients outside of professional work settings
  • Post about your work or clients on personal social media accounts
  • Share client information via personal devices
  • Leave client information unsecured

Consequences: Violation of confidentiality is grounds for immediate termination and potential legal action.

Phone & Device Use
  • Personal phone use is not permitted during client care time except for emergencies
  • Do not photograph clients or share any images without explicit permission
  • All work-related communication should go through the CHM app

NO SOLICITATION POLICY
Staff shall not solicit, accept, or perform work for any CHM client outside of an official CHM contract. This is strictly prohibited and includes private arrangements, side deals, or work under different entity names.

Engaging in private dealings with CHM clients for services that CHM offers is forbidden for the duration of employment AND for 24 months after separation from CHM.

Violation of this no-solicitation policy is a material breach and may result in legal action and liquidated damages.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STAFF TRANSPORTATION POLICY & OPERATIONAL GUIDELINES

Commitment to Exceptional Service

At Convenience Hub of Maryland, our commitment to exceptional client service relies heavily on the punctuality, reliability, and readiness of our professional team. Because our staff members frequently claim multiple shifts in a single day across different locations to maximize their working hours and daily earnings, dependable personal transportation is an absolute operational requirement.

1. MANDATORY TRANSPORTATION REQUIREMENT

Reliable Personal Vehicle
All active staff members must own, lease, or have consistent, unobstructed access to a reliable personal motor vehicle. Public transit or rideshare apps alone are generally insufficient due to the multi-location scheduling demands of our service portfolio.

Valid Documentation
Staff must maintain a valid driver's license, current vehicle registration, and active auto insurance policy meeting state minimum requirements at all times.

Vehicle Readiness
Vehicles must be regularly serviced, fuel-efficient, and maintained in a clean, dependable operating condition to prevent unexpected mechanical breakdowns.

2. MANAGING MULTI-SHIFT DAYS & DIFFERENT LOCATIONS

Optimizing Daily Hours
To make the most of your schedule and secure strong working hours each day, staff are permitted and encouraged to claim multiple shifts. However, the logistics of managing multiple locations throughout the day require careful planning and reliable transportation.

Geographic Variances
Because claimed shifts are often located in different neighborhoods, cities, or regions—spanning Maryland, Virginia, and the D.C. metro area—transit time between back-to-back appointments must be carefully accounted for. You may be scheduled to work a morning shift in one suburb and an afternoon shift in another area entirely.

Buffer and Travel Planning
Staff are solely responsible for mapping out transit routes between locations ahead of time, factoring in peak traffic patterns, weather variables, and parking logistics to ensure seamless arrivals. This is not negotiable. Poor planning is your responsibility, not CHM's.

3. PUNCTUALITY & ATTENDANCE EXPECTATIONS

On-Time Arrival
Staff are required to arrive at every claimed shift location promptly at the scheduled start time. Being late disrupts client expectations and compromises subsequent shifts. Each client expects punctuality and professionalism.

Zero Tolerance for Transit Delays
Relying on unreliable transportation or failing to plan for inter-shift travel distance will not be accepted as a valid excuse for tardiness or missed shifts. If you claim a shift, you must be able to meet that commitment.

Immediate Communication
In the rare event of an unavoidable transit emergency (such as a sudden vehicular accident or severe roadside hazard), staff must immediately notify management and affected clients with as much advance notice as possible.

4. PROFESSIONAL PREPAREDNESS

Equipment and Supplies
Your vehicle serves as your mobile workspace base. You must ensure there is adequate trunk or interior space to securely store cleaning supplies, equipment, uniforms, or shift materials required for multiple back-to-back jobs.

Weather Readiness
During inclement weather conditions (heavy rain, snow, or ice), staff with reliable vehicles are still expected to exercise proper winter driving precautions and maintain standard schedule commitments unless official travel bans are enacted by local authorities.

Mileage Reimbursement
CHM reimburses mileage at the rate of $0.56 per mile for travel between claimed shifts and for service-related mileage. Keep detailed records of all work-related driving for reimbursement.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. TRAINING & DEVELOPMENT

Required Orientation & Training
Before your first shift, you must complete:
  1. This Orientation Document (reading now)
  2. Acknowledgment of this document
  3. Required Training Modules at https://conveniencehubofmaryland.com/staff/training-modules
  4. Certification verification

Training Portal Access
  • You'll receive login credentials to access all required training modules
  • Modules are self-paced and typically take 1-3 hours
  • You must pass each module with a score of 80% or higher
  • Modules must be completed before your first assignment

Ongoing Development
  • CHM is committed to your professional development
  • Career advancement is available for reliable, high-performing employees
  • We support ongoing certifications (CNA, GNA, CPR, First Aid, etc.)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. FIRST DAY DETAILS

Documents You Must Bring
  • Valid government-issued photo ID
  • Social Security number (for W-4 and tax purposes)
  • Proof of eligibility to work in the U.S. (I-9 documents)
  • Direct deposit information
  • Any professional certifications

What to Expect
  • You'll receive your CHM ID badge and employee handbook
  • System access will be set up (email, Claim Shift portal, Training portal)
  • You'll meet your team and receive workspace orientation
  • Your first assignment or schedule will be confirmed

Important First-Week Tasks
  • Complete all online training modules
  • Shadow an experienced team member for your first 1-2 assignments
  • Confirm your schedule and first paycheck details


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. CONTACT INFORMATION & SUPPORT

HR & Administration
  Email: conveniencehubofmaryland@gmail.com
  Phone: 202-579-2944
  Hours: Monday–Saturday, 9 AM–9 PM

Your Direct Supervisor
  Will be provided on your first day

Emergency Support
  202-579-2944 (Mon–Sat, 9 AM–9 PM)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. MEMORANDUM OF UNDERSTANDING
   CLIENT NON-SOLICITATION & CONFIDENTIALITY AGREEMENT

Purpose
CHM provides comprehensive client-based concierge and home management services across Washington D.C., Maryland, and Virginia. To protect clients, maintain business operations, and ensure fair compensation, all Staff must comply with these terms.

NON-SOLICITATION & OUTSIDE WORK PROHIBITION

Staff shall not, directly or indirectly:
  1. Solicit, accept, or perform work for any CHM client outside of an official CHM contract, including as a side deal, private arrangement, or under a different entity name.
  
  2. Engage in private dealings with any CHM client for services that CHM offers, for the duration of employment AND for 24 months after separation.
  
  3. Share CHM client contact details with any third party for personal gain without
