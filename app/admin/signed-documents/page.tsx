import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import Link from 'next/link'

type SignedApplicant = {
  id: string
  full_name: string
  email: string
  position: string
  orientation_accepted_at: string
  type: 'orientation'
}

type SignedOfferLetter = {
  id: string
  applicant_id: string
  full_name: string
  position: string
  signed_at: string
  type: 'offer_letter'
}

export const metadata = {
  title: 'Signed Documents | CHM Admin',
  description: 'View and download signed orientation documents and offer letters',
}

export default async function SignedDocumentsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const applicants = await dbSelectAuth<SignedApplicant>(
    'offer_letter_applicants',
    token,
    {
      select: 'id,full_name,email,position,orientation_accepted_at',
      order: 'orientation_accepted_at.desc',
    }
  )

  const offerLetters = await dbSelectAuth<any>(
    'offer_letters',
    token,
    {
      select: 'id,applicant_id,position,signed_at,offer_letter_applicants(full_name)',
      order: 'signed_at.desc',
    }
  )

  // Format orientation documents
  const signedOrientations = applicants
    .filter(a => a.orientation_accepted_at)
    .map(a => ({
      ...a,
      type: 'orientation' as const,
    }))

  // Format offer letters
  const signedOffers = offerLetters
    .filter(o => o.signed_at)
    .map(o => ({
      id: o.id,
      applicant_id: o.applicant_id,
      full_name: o.offer_letter_applicants?.full_name || 'Unknown',
      position: o.position,
      signed_at: o.signed_at,
      type: 'offer_letter' as const,
    }))

  // Combine and sort by date
  const allDocuments = [
    ...signedOrientations.map(a => ({
      ...a,
      date: a.orientation_accepted_at,
    })),
    ...signedOffers.map(o => ({
      ...o,
      date: o.signed_at,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Signed Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          {allDocuments.length} document{allDocuments.length !== 1 ? 's' : ''} signed and acknowledged
        </p>
      </div>

      {allDocuments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">No signed documents yet.</p>
          <p className="text-gray-500 mt-2">Documents will appear here once staff sign them.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  Position
                </th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  Document Type
                </th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  Signed Date
                </th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {allDocuments.map(doc => (
                <tr key={`${doc.type}-${doc.id}`} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-chm-black">{doc.full_name}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doc.position}</td>
                  <td className="py-3 px-4 text-gray-600">{doc.email || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded ${
                      doc.type === 'orientation' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {doc.type === 'orientation' ? 'Orientation' : 'Offer Letter'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {new Date(doc.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {doc.type === 'orientation' ? (
                      <Link
                        href={`/admin/signed-documents/${doc.id}`}
                        className="text-chm-red hover:underline font-semibold text-xs"
                      >
                        View
                      </Link>
                    ) : (
                      
                        href={`/api/admin/offer-letters/download/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-chm-red hover:underline font-semibold text-xs"
                      >
                        Download PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
