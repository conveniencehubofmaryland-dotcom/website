import Link from 'next/link'

export const metadata = {
  title: 'Thank You | Convenience Hub of Maryland',
  description: 'Your orientation has been signed. Next steps for your CHM onboarding.',
}

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const position = params.position ? decodeURIComponent(params.position) : null
  const applicantId = params.applicant_id || null

  if (!position || !applicantId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-8 text-center">
            <h1 className="font-serif text-2xl text-red-700 mb-4">Invalid Link</h1>
            <p className="text-red-600 mb-6">Please start your onboarding from the beginning.</p>
            <a href="/welcome-center" className="inline-block bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
              Start Over
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 shadow-sm rounded text-center">
          <div className="w-12 h-px bg-chm-red mx-auto mb-8" />
          
          <div className="mb-8">
            <div className="text-6xl mb-6">✓</div>
            <h1 className="font-serif text-4xl text-chm-black mb-4">Thank You!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your orientation has been signed and your agreement acknowledged.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-serif text-xl text-chm-black mb-4">What Happens Next</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex gap-4">
                <span className="text-chm-red font-semibold min-w-fit">1. HR Contact</span>
                <p>Our HR team will contact you within 1-2 business days to collect remaining paperwork: W-4 form, I-9 verification, direct deposit setup, and any certifications you have.</p>
              </div>
              <div className="flex gap-4">
                <span className="text-chm-red font-semibold min-w-fit">2. Training</span>
                <p>Complete all required training modules on your own schedule. You need to score 80% or higher on each quiz to pass. Training typically takes 1-3 hours.</p>
              </div>
              <div className="flex gap-4">
                <span className="text-chm-red font-semibold min-w-fit">3. Ready to Work</span>
                <p>Once training is complete and your paperwork is done, you can browse and claim shifts on our portal. You only work shifts you actively claim.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8 text-sm text-gray-600">
            <p className="mb-3"><strong>Your Position (Locked):</strong></p>
            <p className="text-lg font-semibold text-chm-black mb-4">{position}</p>
            <p className="text-xs">This position is locked throughout your onboarding. If you need to change positions, you&apos;ll need to speak with HR after onboarding is complete.</p>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-xl text-chm-black mb-4">Questions?</h2>
            <div className="space-y-2 text-sm text-gray-700 mb-6">
              <p><strong>Email:</strong> conveniencehubofmaryland@gmail.com</p>
              <p><strong>Phone:</strong> 202-579-2944</p>
              <p><strong>Hours:</strong> Monday–Saturday, 9 AM–9 PM</p>
            </div>
          </div>

          <Link href="/staff/training-modules" className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
            Start Training Modules
          </Link>
        </div>
      </div>
    </div>
  )
}
