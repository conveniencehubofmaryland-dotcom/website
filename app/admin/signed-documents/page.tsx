import { cookies } from 'next/headers'
import { dbSelectAuth } from '@/lib/db'
import Link from 'next/link'

type SignedApplicant = {
  id: string
  full_name: string
  email: string
  position: string
  orientation_accepted: boolean
  orientation_accepted_at: string
  full_signature: string | null
}

export const metadata = {
  title: 'Signed Documents | CHM Admin',
  description: 'View and download signed orientation documents and MOUs',
}

export default async function SignedDocumentsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('chm_admin')?.value ?? ''

  const applicants = await dbSelectAuth<SignedApplicant>(
    'offer_letter_applicants',
    token,
    {
      select: '*',
      order: 'orientation_accepted_at.desc',
    }
  )

  const signed = applicants.filter(a => a.orientation_accepted && a.orientation_accepted_at)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-chm-black">Signed Documents</h1>
        <p className="text-sm text-gray-500 mt-1">
          {signed.length} orientation{signed.length !== 1 ? 's' : ''} signed and acknowledged
        </p>
      </div>

      {signed.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">No signed documents yet.</p>
          <p className="text-gray-500 mt-2">Orientations will appear here once staff sign them.</p>
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
                  Signed Date
                </th>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-widest text-gray-500 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {signed.map(applicant => (
                <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-chm-black">{applicant.full_name}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{applicant.position}</td>
                  <td className="py-3 px-4 text-gray-600">{applicant.email}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {new Date(applicant.orientation_accepted_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/signed-documents/${applicant.id}`}
                      className="text-chm-red hover:underline font-semibold text-xs"
                    >
                      View & Print
                    </Link>
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
