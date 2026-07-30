export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="w-12 h-px bg-chm-red mb-6" />
          <h1 className="font-serif text-4xl text-chm-black mb-2">Support</h1>
          <p className="text-gray-600">We&apos;re here to help. Get answers to common questions or contact our team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Contact Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-3xl">💬</div>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Contact HR</h2>
                <p className="text-sm text-gray-600 mb-4">Reach out directly to our team for any questions about shifts, training, or onboarding.</p>
              </div>
            </div>

            <div className="space-y-4 bg-cream p-6 rounded-lg">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">Email</p>
                <a href="mailto:conveniencehubofmaryland@gmail.com" className="text-chm-red hover:underline font-semibold">
                  conveniencehubofmaryland@gmail.com
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">Phone</p>
                <a href="tel:202-579-2944" className="text-chm-red hover:underline font-semibold">
                  202-579-2944
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-1">Hours</p>
                <p className="text-sm text-gray-700">Monday–Saturday, 9 AM–9 PM</p>
              </div>
            </div>
          </div>

          {/* FAQ Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-3xl">❓</div>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-2">Frequently Asked Questions</h2>
                <p className="text-sm text-gray-600">Find quick answers to common questions about your shifts, pay, and more.</p>
              </div>
            </div>

            <div className="space-y-4">
  <details className="bg-cream p-4 rounded-lg cursor-pointer group">
    <summary className="font-semibold text-chm-black text-sm select-none hover:text-chm-red transition-colors">
      How do I claim a shift?
    </summary>
    <div className="text-sm text-gray-600 mt-3">
      Visit the <strong>Available Shifts</strong> section, browse open shifts, and click <strong>Claim Shift</strong>. You&apos;ll receive a confirmation email with all details.
    </div>
  </details>

  <details className="bg-cream p-4 rounded-lg cursor-pointer group">
    <summary className="font-semibold text-chm-black text-sm select-none hover:text-chm-red transition-colors">
      When do I get paid?
    </summary>
    <div className="text-sm text-gray-600 mt-3">
      You&apos;re paid weekly, typically on Fridays, for work completed in the prior week. Payment is direct deposit to the account you provided during onboarding.
    </div>
  </details>

  <details className="bg-cream p-4 rounded-lg cursor-pointer group">
    <summary className="font-semibold text-chm-black text-sm select-none hover:text-chm-red transition-colors">
      How do I cancel or reschedule a shift?
    </summary>
    <div className="text-sm text-gray-600 mt-3">
      Contact HR at least 2 hours before your shift start time. Call <strong>202-579-2944</strong> or email <strong>conveniencehubofmaryland@gmail.com</strong> with your shift details.
    </div>
  </details>

  <details className="bg-cream p-4 rounded-lg cursor-pointer group">
    <summary className="font-semibold text-chm-black text-sm select-none hover:text-chm-red transition-colors">
      What if I can&apos;t make a claimed shift?
    </summary>
    <div className="text-sm text-gray-600 mt-3">
      Notify HR as soon as possible. Repeated no-shows may affect your access to shifts. We understand emergencies happen—communicate with us.
    </div>
  </details>

  <details className="bg-cream p-4 rounded-lg cursor-pointer group">
    <summary className="font-semibold text-chm-black text-sm select-none hover:text-chm-red transition-colors">
      How do I reset my password?
    </summary>
    <div className="text-sm text-gray-600 mt-3">
      Use the <strong>Forgot Password</strong> link on the login page, or contact HR for assistance resetting your account access.
    </div>
  </details>
</div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-chm-red/10 border border-chm-red/20 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Need more help?</p>
          <p className="text-lg font-semibold text-chm-black mb-6">Our HR team is ready to assist Monday–Saturday, 9 AM–9 PM.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:conveniencehubofmaryland@gmail.com" className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors rounded">
              Email Support
            </a>
            <a href="tel:202-579-2944" className="inline-block border-2 border-chm-red text-chm-red px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-chm-red hover:text-white transition-colors rounded">
              Call HR
            </a>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <a href="/staff" className="text-chm-red hover:underline font-semibold text-sm uppercase tracking-widest">
            ← Back to Staff Portal
          </a>
        </div>
      </div>
    </div>
  )
}
