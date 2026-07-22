import Link from 'next/link'

export const metadata = {
  title: 'How CHM Works for Staff | Convenience Hub of Maryland',
  description: 'Your guide to the CHM staff platform: onboarding, training, shifts, and support.',
}

export default function StaffHowItWorksPage() {
  return (
    <div className="bg-white">
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Getting Started</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black">How CHM Works for Staff</h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-2xl text-sm leading-relaxed font-light">
            Everything you need to know to start working with Convenience Hub of Maryland — from day one.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16">
        <div className="space-y-16">

          {/* Step 1 */}
          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">1</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Complete Your Welcome Profile</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  When you join CHM, you'll receive an offer letter with a link to sign digitally on this platform. This is your first step and only takes 5 minutes.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>What you'll do:</strong> Fill in your name, email, phone, position, and address. Sign the offer letter electronically. That's it.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Why it matters:</strong> Your profile unlocks everything else — training, shifts, and payments. Without completing this, you can't proceed.
                </p>
                <div className="mt-6 bg-chm-red/5 border border-chm-red/10 p-4 rounded">
                  <p className="text-xs text-chm-red font-semibold uppercase mb-1">💡 Pro Tip</p>
                  <p className="text-sm text-gray-700">Sign your offer letter right away. You're officially hired once you do!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">2</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Complete Required Training Modules</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  After signing your offer, training modules unlock automatically. You must complete all required training before your first shift.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>What you'll do:</strong> Watch training videos, read materials, and take a short quiz at the end (you need to score 80% or higher to pass). Training takes about 2-4 hours total, depending on your role.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Training covers:</strong> CHM's values and standards, safety protocols, customer service, how to use the shift-claiming system, and role-specific skills (cleaning techniques, nanny protocols, etc.).
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Why it matters:</strong> We want you set up for success. This training ensures you know what to expect and how to deliver the quality our clients count on.
                </p>
                <div className="mt-6 bg-chm-red/5 border border-chm-red/10 p-4 rounded">
                  <p className="text-xs text-chm-red font-semibold uppercase mb-1">💡 Pro Tip</p>
                  <p className="text-sm text-gray-700">Take notes and don't rush the training. If you score below 80%, you can retake the quiz once. We're here to help you succeed.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">3</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Claim Your Shifts — Only Work Shifts You Sign Up For</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Once training is done, shifts become available to claim. You'll see a list of upcoming available shifts on your dashboard. Pick the ones that work for you.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>What you'll do:</strong> Browse available shifts by date, time, and location. Click "Claim Shift" to book. You can claim as many or as few as you want — it's up to you.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Important:</strong> Only work shifts you've officially claimed through this platform. Any shifts worked outside the system won't be paid, and you won't be covered by CHM's insurance.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Why it matters:</strong> This keeps everyone on the same page. You know exactly when and where you're working, and we know who's covering each job. No surprises.
                </p>
                <div className="mt-6 bg-chm-red/5 border border-chm-red/10 p-4 rounded">
                  <p className="text-xs text-chm-red font-semibold uppercase mb-1">💡 Pro Tip</p>
                  <p className="text-sm text-gray-700">Check the shift calendar often. New shifts open regularly. If you see a shift you want but it's already claimed, message support — sometimes shifts open up as others drop them.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">4</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Track Your Certifications & Keep Documents Current</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  All staff at CHM must maintain current certifications (background checks, CPR, training completion). You can see your certification status anytime in your staff profile.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>What you need:</strong> For most roles, a background check and training completion. Some roles (like nanny) may require CPR. Your manager will tell you exactly what's needed for your position.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Expiration alerts:</strong> We'll email and text you 30 days before any certification expires. No surprise lapses — we stay on top of this together.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Why it matters:</strong> Working in people's homes means trust is everything. Current certifications (especially background checks) are non-negotiable for client safety and legal compliance.
                </p>
                <div className="mt-6 bg-chm-red/5 border border-chm-red/10 p-4 rounded">
                  <p className="text-xs text-chm-red font-semibold uppercase mb-1">💡 Pro Tip</p>
                  <p className="text-sm text-gray-700">When you get a reminder about an expiring cert, don't wait. Renew it right away. If your cert lapses, you can't work until it's current again.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="border-l-4 border-chm-red pl-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-serif text-chm-red min-w-fit">5</span>
              <div>
                <h2 className="font-serif text-2xl text-chm-black mb-3">Get Support — We're Here to Help</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Questions? Issues? Bugs in the app? Don't call or text directly. Use the support system so nothing falls through the cracks.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>How to get help:</strong> Click "Support" in your staff dashboard. Describe your issue, and you'll get a ticket number. We respond to all support requests within 24 hours.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Common issues we help with:</strong> Can't claim a shift? Technical bug? Certification question? Payroll issue? Payment problem? That's what support is for.
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Why it matters:</strong> A support ticket means your issue is documented and tracked. It's better than a text that might get missed — we promise to address it.
                </p>
                <div className="mt-6 bg-chm-red/5 border border-chm-red/10 p-4 rounded">
                  <p className="text-xs text-chm-red font-semibold uppercase mb-1">💡 Pro Tip</p>
                  <p className="text-sm text-gray-700">Be as specific as possible in support tickets. "Can't claim shift for 3/15" is better than "something's broken." The more detail, the faster we solve it.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Key Principles */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="font-serif text-2xl text-chm-black mb-8">Key Principles for Working with CHM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded">
              <p className="font-semibold text-chm-black mb-2">✓ One Source of Truth</p>
              <p className="text-sm text-gray-600">Everything you need is on this platform. Don't rely on texts, calls, or word-of-mouth. If it's not in the system, ask support to add it.</p>
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

        {/* CTA */}
        <div className="mt-16 pt-12 border-t border-gray-200 text-center">
          <h2 className="font-serif text-2xl text-chm-black mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">If you have your offer letter, let's go through orientation together.</p>
          <Link href="/staff/welcome" className="inline-block bg-chm-red text-white px-8 py-3 font-semibold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
            Start Your Orientation
          </Link>
        </div>

        {/* FAQ-style Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="font-serif text-2xl text-chm-black mb-8">Quick Questions?</h2>
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-chm-black mb-2">Do I have to use the website? Can't you just text me shifts?</p>
              <p className="text-sm text-gray-600">No — this is how we operate. It keeps things fair (first-come, first-served for shifts), organized (you always know where to look), and legal (we track everything for compliance). Everyone uses the same system.</p>
            </div>
            <div>
              <p className="font-semibold text-chm-black mb-2">What if I don't pass the training quiz?</p>
              <p className="text-sm text-gray-600">You can retake it once. If you fail twice, we'll have a conversation about whether the role is the right fit. Most people pass on the first try — take your time and use the materials.</p>
            </div>
            <div>
              <p className="font-semibold text-chm-black mb-2">Can I drop a shift once I've claimed it?</p>
              <p className="text-sm text-gray-600">Yes, but give us at least 24 hours' notice. Dropping shifts last-minute hurts clients and your teammates. If it becomes a pattern, we'll talk about it.</p>
            </div>
            <div>
              <p className="font-semibold text-chm-black mb-2">What happens if my background check expires?</p>
              <p className="text-sm text-gray-600">You'll get an alert 30 days before. Renew it immediately. Once it expires, you can't claim shifts until it's current again. We can't send you into clients' homes without an active background check.</p>
            </div>
            <div>
              <p className="font-semibold text-chm-black mb-2">I have a question that's not answered here. What do I do?</p>
              <p className="text-sm text-gray-600">Use the Support feature in your staff dashboard. We respond within 24 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
