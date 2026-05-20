import type { Metadata } from 'next'
import { dbSelect } from '@/lib/db'
import type { JobPosting } from '@/lib/types'
import AnimatedSection from '@/components/AnimatedSection'
import CareersForm from '@/components/CareersForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the Convenience Hub of Maryland team. We\'re hiring professionals in Maryland, Virginia, and Washington D.C. Flexible schedules, competitive pay.',
}

const FALLBACK_POSITIONS = [
  'Cleaning Specialist',
  'Laundry Handler',
  'Culinary & Housekeeping Staff',
  'Nanny / Childcare Staff',
  'Care Companion (Adult)',
  'Commercial Cleaner',
]

const WHY = [
  { icon: '◆', title: 'Flexible Hours',  desc: 'Work the schedule that fits your life — mornings, afternoons, or evenings.' },
  { icon: '★', title: 'Competitive Pay', desc: 'Above-market rates with opportunities for recurring client bonuses.' },
  { icon: '✓', title: 'Vetted Team',     desc: 'Join a professional, background-checked team trusted by DMV families.' },
  { icon: '↑', title: 'Growth',          desc: 'Start in one role and expand into others as you grow with us.' },
]

export default async function CareersPage() {
  const postings = await dbSelect<JobPosting>('job_postings', { active: 'eq.true', order: 'created_at.asc' })
  const positions = postings.length > 0 ? postings.map(p => p.title) : FALLBACK_POSITIONS

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-cream py-10 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Join Our Team</p>
          <h1 className="font-serif text-5xl md:text-6xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            Apply With Us
          </h1>
          <div className="w-12 h-px bg-chm-red mt-6 mb-4" />
          <p className="text-gray-400 max-w-xl text-sm leading-relaxed font-light">
            We&apos;re hiring professionals in Maryland, Virginia, and Washington D.C. Background-checked, flexible schedules, competitive pay.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 space-y-16">

        {/* Why work with us */}
        <AnimatedSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100">
            {WHY.map((w, i) => (
              <AnimatedSection key={w.title} delay={i * 60}>
                <div className="bg-white p-8 hover:bg-cream transition-colors h-full">
                  <div className="text-chm-red text-xl mb-4">{w.icon}</div>
                  <p className="font-semibold text-chm-black text-sm uppercase tracking-widest mb-2">{w.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{w.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        {/* Application form */}
        <AnimatedSection>
          <div className="border-t border-chm-red/20 pt-10">
            <p className="text-chm-red text-xs font-semibold uppercase tracking-[0.3em] mb-3">Application</p>
            <h2 className="font-serif text-3xl text-chm-black mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Get Started
            </h2>
            <div className="w-10 h-px bg-chm-red mb-8" />
            <CareersForm positions={positions} />
          </div>
        </AnimatedSection>

      </div>
    </div>
  )
}
