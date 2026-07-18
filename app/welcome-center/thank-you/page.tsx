export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-px bg-chm-red mx-auto mb-6" />
        
        <h1 className="font-serif text-3xl text-chm-black mb-4">Welcome Aboard!</h1>
        
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          Thank you for completing your orientation and signing the Memorandum of Understanding. Your acknowledgment has been recorded.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-left">
          <h3 className="font-semibold text-chm-black text-sm mb-3">Next Steps:</h3>
          <ol className="space-y-2 text-xs text-gray-700">
            <li><strong>1.</strong> Complete all required training modules</li>
            <li><strong>2.</strong> Review your offer letter (coming soon)</li>
            <li><strong>3.</strong> Prepare required documents for day 1</li>
            <li><strong>4.</strong> Claim your first shift when available</li>
          </ol>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          A confirmation email has been sent to your email address. Check your inbox for training module access details.
        </p>

        <div className="space-y-3">
          <a href="/staff/training-modules" className="inline-block bg-chm-red text-white px-6 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
            View Training Modules
          </a>
          <p className="text-xs text-gray-400">
            Questions? Call 202-579-2944<br/>Mon–Sat, 9 AM–9 PM
          </p>
        </div>
      </div>
    </div>
  )
}
