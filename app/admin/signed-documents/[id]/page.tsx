import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import DocumentViewer from './viewer'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Signed Document | CHM Admin',
  }
}

export default async function SignedDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const hasAuth = !!cookieStore.get('chm_admin')?.value

  if (!hasAuth) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-600 text-lg">Authentication required.</p>
        <Link href="/admin" className="text-chm-red hover:underline mt-4 inline-block">
          Back to Admin
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-chm-black">Signed Document</h1>
        <Link
          href="/admin/signed-documents"
          className="bg-gray-200 text-gray-700 px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-gray-300"
        >
          Back
        </Link>
      </div>

      <div className="bg-white p-12 shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>
        <DocumentViewer docId={id} />
      </div>
    </div>
  )
}
