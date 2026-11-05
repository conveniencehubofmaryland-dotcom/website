'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { TrainingModule, QuizQuestion } from '@/lib/types'
import {
  RESIDENTIAL_TIERS,
  splitResidentialFee,
  type ResidentialTierKey,
} from '@/lib/contractor-compensation'

// Set to false to hide the compensation section on this page.
// Keep false until the CPA / employment attorney review is complete.
const SHOW_CONTRACTOR_COMPENSATION = true

const POSITION_TIERS: Record<string, Array<{ service: string; tier: ResidentialTierKey }>> = {
  'Housekeeping Staff': [
    { service: 'Regular housekeeping', tier: 'XL' },
  ],
  'Care Companion (Adult/Senior)': [
    { service: 'Care companion (elderly)', tier: 'XL' },
  ],
  'Nanny/Childcare Specialist': [
    { service: 'Nanny / childcare', tier: 'XL' },
  ],
  'Cleaning Specialist': [
    { service: 'One-time and monthly cleaning', tier: 'BLUE' },
    { service: 'Bi-weekly and weekly cleaning', tier: 'PRIORITY' },
  ],
  'Laundry Handler': [
    { service: 'Laundry handling', tier: 'BLUE' },
  ],
  'Culinary/Chef': [
    { service: 'Culinary', tier: 'PRIORITY' },
  ],
}

// Matches a module's position to a POSITION_TIERS key, ignoring spaces,
// slashes, capital letters, and small wording differences.
function findPositionTiers(position: string | undefined) {
  if (!position) return undefined
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')
  const p = clean(position)
  const key = Object.keys(POSITION_TIERS).find(k => {
    const c = clean(k)
    return c === p || c.includes(p) || p.includes(c)
  })
  return key ? POSITION_TIERS[key] : undefined
}

const RESIDENTIAL_INCENTIVES = [
  'Five-star client reviews (4 or more in a month): $50 – $100 per month',
  'Zero complaints for the quarter: $100 – $150',
  'Referral of a new client who books service: $50 – $100 per client',
]

export default function TrainingModuleDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const router = useRouter()
  const [module, setModule] = useState<TrainingModule | null>(null)
  const [staffName, setStaffName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPhone, setStaffPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showQuiz, setShowQuiz] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [saveError, setSaveError] = useState('')
  const [moduleId, setModuleId] = useState('')

  useEffect(() => {
    async function init() {
      const p = await params
      const sp = await searchParams
      setModuleId(p.id)
      setStaffName((sp.name as string) || '')
      setStaffEmail((sp.email as string) || '')
      setStaffPhone((sp.phone as string) || '')
      await fetchModule(p.id)
    }
    init()
  }, [params, searchParams])

  async function fetchModule(id: string) {
    try {
      setLoading(true)
      const res = await fetch(`/api/training/modules?id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Failed to fetch module')
      const data = await res.json()
      if (data.length > 0) {
        setModule(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading module')
    } finally {
      setLoading(false)
    }
  }

  async function handleQuizSubmit() {
    if (!module) return
    const questions = module.quiz_questions || []
    let correctCount = 0
    questions.forEach((q: QuizQuestion) => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++
      }
    })
    const calculatedScore = Math.round((correctCount / questions.length) * 100)
    setScore(calculatedScore)
    const passed = calculatedScore >= 80

    if (!staffName || !staffEmail) {
      setSaveError('Your name and email were missing, so this result was NOT saved. Please go back to the module list and fill in your info first.')
      setSubmitted(true)
      return
    }

    try {
      const res = await fetch('/api/training/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_name: staffName,
          staff_email: staffEmail,
          staff_phone: staffPhone,
          position: module.position,
          module_id: module.id,
          quiz_score: calculatedScore,
          status: passed ? 'completed' : 'failed',
        }),
      })

      if (!res.ok) {
        console.error('Progress save failed:', await res.text())
        setSaveError('There was a problem saving your result. Please contact your manager.')
        setSubmitted(true)
        return
      }

      if (passed) {
        setTimeout(() => {
          router.push(`/staff/training-modules/${moduleId}/thank-you`)
        }, 500)
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Error saving progress:', err)
      setSaveError('There was a problem saving your result. Please contact your manager.')
      setSubmitted(true)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading module...</div>
  if (error) return <div className="text-center py-20 text-chm-red">{error}</div>
  if (!module) return <div className="text-center py-20 text-gray-400">Module not found</div>

  const questions = module.quiz_questions || []
  const passed = score >= 80
  const positionTiers = findPositionTiers(module.position)

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          <Link href="/staff/training-modules" className="text-xs text-gray-400 hover:text-chm-red uppercase tracking-widest mb-4 inline-block">
            ← Back to Modules
          </Link>
          <h1 className="font-serif text-4xl text-chm-black" style={{ fontFamily: 'var(--font-serif)' }}>
            {module.title}
          </h1>
          <p className="text-gray-500 text-sm mt-3">{staffName} • {module.position}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
        {!showQuiz && !submitted && (
          <div>
            <div className="prose max-w-none mb-12">
              <div className="bg-gray-50 border border-gray-200 p-8 rounded">
                <h2 className="text-2xl font-semibold text-chm-black mb-4">Module Content</h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {module.content || 'No content available'}
                </div>
              </div>
            </div>

            {SHOW_CONTRACTOR_COMPENSATION && positionTiers && (
              <div className="mb-12 bg-gradient-to-br from-chm-red/5 to-chm-red/10 border border-chm-red/20 rounded-lg p-8">
                <div className="mb-8">
                  <h2 className="font-serif text-3xl text-chm-black mb-2">Your Compensation</h2>
                  <p className="text-gray-600 text-sm">Position: <span className="font-semibold text-chm-black">{module.position}</span></p>
                </div>

                <div className="mb-8 bg-white border border-gray-200 p-5 rounded text-sm text-gray-700">
                  You are an independent contractor. You set your own availability and may decline assignments without penalty. Your share is a percentage of each client service fee.
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-chm-black mb-4">Your Share of Client Fees</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {positionTiers.map(item => {
                      const t = RESIDENTIAL_TIERS[item.tier]
                      const perHundred = splitResidentialFee(100, item.tier).contractor
                      return (
                        <div key={item.tier} className="bg-white border border-gray-200 p-4 rounded">
                          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{t.label}</p>
                          <p className="text-sm text-gray-700 mb-3">{item.service}</p>
                          <p className="text-2xl font-bold text-chm-red">{Math.round(t.providerShare * 100)}%</p>
                          <p className="text-xs text-gray-600 mt-2">You keep ${perHundred.toFixed(2)} of every $100 in client fees.</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded mb-8">
                  <h3 className="text-lg font-semibold text-chm-black mb-2">Optional Performance Incentives</h3>
                  <p className="text-xs text-gray-500 mb-4">Paid from the CHM share. These are optional bonuses, not wages, and they do not change your tier.</p>
                  <div className="space-y-2">
                    {RESIDENTIAL_INCENTIVES.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-chm-red font-bold">✓</span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded">
                  <h3 className="text-lg font-semibold text-chm-black mb-4">Payments</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>Payouts are processed weekly on Fridays by direct bank transfer or check.</p>
                    <p>You receive a statement with each payout showing the client fee, your tier, the CHM share, incentives, and the amount paid.</p>
                    <p>A completed IRS Form W-9 is required before your first payment.</p>
                    <p>CHM does not withhold income or payroll taxes. You are responsible for your own taxes, business licenses, insurance, and supplies unless your written agreement says otherwise.</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowQuiz(true)}
              className="bg-chm-red text-white px-10 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
            >
              Start Quiz ({questions.length} questions)
            </button>
          </div>
        )}

        {showQuiz && !submitted && (
          <div>
            <h2 className="text-2xl font-semibold text-chm-black mb-8">Quiz</h2>
            <div className="space-y-8">
              {questions.map((q: QuizQuestion, idx: number) => (
                <div key={q.id} className="border border-gray-200 p-6">
                  <p className="font-semibold text-chm-black mb-4">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="space-y-3">
                    {q.options.map((option: string) => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                          className="w-4 h-4 accent-chm-red"
                        />
                        <span className="text-gray-600">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className="mt-8 bg-chm-red text-white px-10 py-3 font-semibold text-sm uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          </div>
        )}

        {submitted && !passed && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-4xl">
              ✗
            </div>
            <h2 className="font-serif text-3xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
              Not Quite There
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Your Score: <span className="font-bold text-chm-red">{score}%</span>
            </p>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You need 80% to pass. Review the module content and try again.
            </p>
            {saveError && (
              <p className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 mb-8 max-w-md mx-auto text-sm">
                {saveError}
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setShowQuiz(true)
                  setSubmitted(false)
                  setAnswers({})
                }}
                className="bg-chm-red text-white px-8 py-2 font-semibold text-sm uppercase tracking-widest hover:bg-red-700"
              >
                Try Again
              </button>
              <Link
                href="/staff/training-modules"
                className="border-2 border-chm-red text-chm-red px-8 py-2 font-semibold text-sm uppercase tracking-widest hover:bg-red-50"
              >
                Back to Modules
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
