import OrientationForm from '@/components/OrientationForm'
import { ORIENTATION_DOCUMENT } from '@/lib/orientation-document'

export default async function OrientationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const position = params.position ? decodeURIComponent(params.position) : null
  const applicantId = params.applicant_id || null

  if (!position || !applicantId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-8 text-center">
            <h1 className="font-serif text-2xl text-red-700 mb-4">Invalid Onboarding Link</h1>
            <p className="text-red-600 mb-6">Please start your onboarding from the beginning.</p>
            <a href="/welcome-center" className="inline-block bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors rounded">Start Over</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 bg-chm-red/10 border border-chm-red/20 rounded p-4">
          <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-1">Your Position (Locked)</p>
          <p className="text-lg font-semibold text-chm-black">{position}</p>
          <p className="text-xs text-gray-500 mt-2">This position cannot be changed. If this is incorrect, please start over.</p>
        </div>

        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-3xl text-chm-black mb-2">Employee Orientation</h1>
          <p className="text-sm text-gray-500">Please read carefully and sign to acknowledge your understanding</p>
        </div>

        <div className="bg-white p-8 shadow-sm mb-8 border border-gray-200 text-sm leading-relaxed text-gray-700">
          <div className="whitespace-pre-wrap break-words max-h-[600px] overflow-y-auto pr-4">
            {ORIENTATION_DOCUMENT}
          </div>
        </div>

        <OrientationForm position={position} applicantId={applicantId} />
      </div>
    </div>
  )
}
