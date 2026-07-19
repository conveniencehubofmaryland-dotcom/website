import Link from 'next/link'

export default function OfferThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        
        <h1 className="font-serif text-3xl text-chm-black mb-4">Welcome to CHM!</h1>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          Thank you for accepting your offer. We&apos;re excited to have you join the Convenience Hub of Maryland team.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-8 text-left">
          <h3 className="font-semibold text-chm-black text-sm mb-3">What Happens Next:</h3>
          <ol className="space-y-2 text-xs text-gray-700">
            <li><strong>1.</strong> Complete all required training modules</li>
            <li><strong>2.</strong> Prepare required documents for day 1</li>
            <li><strong>3.</strong> Claim your first shift when available</li>
            <li><strong>4.</strong> Start your journey with us!</li>
          </ol>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          A confirmation email has been sent to your email address with all the details.
        </p>

        <div className="space-y-3">
          <Link href="/staff/training-modules" className="inline-block bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
            Start Training Modules
          </Link>
          <p className="text-xs text-gray-400">
            Questions? Call 202-579-2944<br/>Mon–Sat, 9 AM–9 PM
          </p>
        </div>
      </div>
    </div>
  )
}
