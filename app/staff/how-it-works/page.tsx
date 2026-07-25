import Link from 'next/link'

export const metadata = {
  title: 'How CHM Works for Staff | Convenience Hub of Maryland',
  description: 'Your guide to the CHM staff platform: onboarding, training, shifts, and support.',
}

export default async function StaffHowItWorksPage() {
  return (
    <div className="bg-white">
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Getting Started</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black">How CHM Works for Staff</h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed font-light">
            Everything you need to know to start working with Convenience Hub of Maryland &mdash; from day one.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
        <div className="space-y-16">

          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">1</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Complete Your Welcome Profile</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Start by selecting your position and filling out your basic information.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">2</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Read &amp; Sign Orientation</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Next, you&apos;ll read our Employee Orientation Document and Memorandum of Understanding. This covers company policies, your rights and responsibilities, confidentiality rules, and the non-solicitation agreement. You&apos;ll sign electronically to confirm you understand everything.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Time needed:</strong> About 30-45 minutes to read carefully.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">3</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Complete Required Training Modules</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  After you sign the orientation, you&apos;ll move to training modules. These are role-specific and cover everything you need to know to do your job well. Each module includes a short quiz &mdash; you need to score 80% or higher to pass. Training typically takes 1-3 hours.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Important:</strong> You cannot work your first shift until training is complete and you&apos;ve passed all quizzes.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">4</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">HR Team Completes Your Paperwork</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  While you&apos;re working through training, our HR team will reach out (within 1-2 business days) to collect the remaining paperwork: W-4 form, I-9 verification, direct deposit setup, and any certifications you have.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>You&apos;ll hear from:</strong> conveniencehubofmaryland@gmail.com or 202-579-2944
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">5</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Claim Your First Shift</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Once training is complete and your paperwork is done, you&apos;re ready! Browse available shifts on our portal and claim the ones that work for your schedule. You only work shifts you actively claim &mdash; never any surprises or off-book arrangements.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Important:</strong> Only claim shifts through our official portal. Side deals or off-book work are strictly prohibited.
                </p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="font-serif text-2xl text-chm-black mb-8">Key Principles for Working with CHM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded">
              <p className="font-semibold text-chm-black mb-2">✓ One Source of Truth</p>
              <p className="text-sm text-gray-600">Everything you need is on this platform. Don&apos;t rely on texts, calls, or word-of-mouth. If it&apos;s not in the system, ask support to add it.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded">
              <p className="font-semibold text-chm-black mb-2">✓ Professional Communication</p>
              <p className="text-sm text-gray-600">Use the staff portal for all work-related communication. It keeps everything organized and documented.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded">
              <p className="font-semibold text-chm-black mb-2">✓ Reliability Matters</p>
              <p className="text-sm text-gray-600">Clients depend on us. Show up on time for every shift you claimed, complete work professionally, and communicate if anything changes.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded">
              <p className="font-semibold text-chm-black mb-2">✓ Stay Current</p>
              <p className="text-sm text-gray-600">Keep your certifications current, complete training, and respond to communications. Lapses in any of these affect your ability to work.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="font-serif text-2xl text-chm-black mb-4">Questions?</h2>
          <p className="text-gray-600 mb-6">
            Our HR team is here to help. Reach out anytime during business hours:
          </p>
          <div className="space-y-2 text-sm text-gray-700 mb-8">
            <p><strong>Email:</strong> conveniencehubofmaryland@gmail.com</p>
            <p><strong>Phone:</strong> 202-579-2944</p>
            <p><strong>Hours:</strong> Monday–Saturday, 9 AM–9 PM</p>
          </div>
          <Link href="/welcome-center" className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}
