'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { TrainingModule, QuizQuestion } from '@/lib/types'

const PAY_STRUCTURE: Record<string, { 
  levels: Array<{ level: string; hourly: string; weekly: string; monthly: string }>;
  leaveIn?: Array<{ level: string; monthly: string }>;
  bonuses: string[] 
}> = {
  'Housekeeping Staff': {
    levels: [
      { level: 'Entry (0–6 mo)', hourly: '$16.00–$18.00', weekly: '$680–$760', monthly: '$2,945–$3,290' },
      { level: 'Standard (6 mo–2 yr)', hourly: '$18.00–$20.00', weekly: '$780–$900', monthly: '$3,380–$3,900' },
      { level: 'Senior (2+ yr)', hourly: '$20.00–$23.00', weekly: '$920–$1,060', monthly: '$3,980–$4,590' },
      { level: 'Premium (3+ yr)', hourly: '$23.00–$25.00', weekly: '$1,080–$1,240', monthly: '$4,680–$5,370' },
    ],
    leaveIn: [
      { level: 'Entry (0–6 mo)', monthly: '$2,000' },
      { level: 'Standard (6 mo–2 yr)', monthly: '$2,500' },
      { level: 'Senior (2+ yr)', monthly: '$3,000' },
      { level: 'Premium (3+ yr)', monthly: '$3,500' },
    ],
    bonuses: ['Client satisfaction', 'Reliability', 'Project completion'],
  },
  'Care Companion (Adult/Senior)': {
    levels: [
      { level: 'Entry (0–6 mo)', hourly: '$16.00–$18.00', weekly: '$760–$880', monthly: '$3,290–$3,810' },
      { level: 'Standard (6 mo–2 yr)', hourly: '$18.00–$20.00', weekly: '$880–$1,040', monthly: '$3,810–$4,500' },
      { level: 'Senior (2+ yr)', hourly: '$20.00–$22.00', weekly: '$1,040–$1,240', monthly: '$4,500–$5,370' },
      { level: 'Premium (3+ yr)', hourly: '$22.00–$25.00', weekly: '$1,240–$1,480', monthly: '$5,370–$6,410' },
    ],
    leaveIn: [
      { level: 'Entry (0–6 mo)', monthly: '$2,000' },
      { level: 'Standard (6 mo–2 yr)', monthly: '$2,500' },
      { level: 'Senior (2+ yr)', monthly: '$3,000' },
      { level: 'Premium (3+ yr)', monthly: '$3,500' },
    ],
    bonuses: ['Client/family satisfaction', 'Reliability',],
  },
  'Nanny/Childcare Specialist': {
    levels: [
      { level: 'Entry Level (0–6 mo)', hourly: '$16.00–$18.00', weekly: '$660–$720', monthly: '$2,858–$3,118' },
      { level: 'Standard (6 mo–2 yr)', hourly: '$18.00–$20.00', weekly: '$740–$820', monthly: '$3,204–$3,551' },
      { level: 'Senior (2+ yr)', hourly: '$20.00–$23.00', weekly: '$800–$940', monthly: '$3,464–$4,070' },
      { level: 'Lead (3+ yr)', hourly: '$23.00–$25.00', weekly: '$920–$1,200', monthly: '$3,984–$5,196' },
    ],
    leaveIn: [
      { level: 'Entry (0–6 mo)', monthly: '$2,000' },
      { level: 'Standard (6 mo–2 yr)', monthly: '$2,500' },
      { level: 'Senior (2+ yr)', monthly: '$3,000' },
      { level: 'Premium (3+ yr)', monthly: '$3,500' },
    ],
    bonuses: ['Child development milestones', 'Family satisfaction',],
  },
  'Cleaning Specialist': {
    levels: [
      { level: 'Entry Level (0–6 mo)', hourly: '$16.00–$18.00', weekly: '$660–$720', monthly: '$2,858–$3,118' },
      { level: 'Standard (6 mo–2 yr)', hourly: '$18.00–$20.00', weekly: '$740–$820', monthly: '$3,204–$3,551' },
      { level: 'Senior (2+ yr)', hourly: '$20.00–$23.00', weekly: '$800–$940', monthly: '$3,464–$4,070' },
      { level: 'Lead (3+ yr)', hourly: '$23.00–$25.00', weekly: '$920–$1,120', monthly: '$3,984–$4,850' },
    ],
    bonuses: ['5-star reviews (4+ monthly): $50–$100/month', 'Perfect attendance (quarterly): $150–$200', 'Referral: $50–$100 per client', 'Tenure: $100–$300 anniversary bonus'],
  },
  'Laundry Handler': {
    levels: [
      { level: 'Entry (0–6 mo)', hourly: '$16.00–$18.00', weekly: '$660–$720', monthly: '$2,860–$3,120' },
      { level: 'Standard (6 mo–2 yr)', hourly: '$18.00–$21.00', weekly: '$740–$840', monthly: '$3,200–$3,640' },
      { level: 'Senior (2+ yr)', hourly: '$21.00–$24.00', weekly: '$860–$980', monthly: '$3,730–$4,240' },
      { level: 'Lead (3+ yr)', hourly: '$24.00–$28.00', weekly: '$1,000–$1,120', monthly: '$4,330–$4,850' },
    ],
    bonuses: ['Zero complaints: $50–$100', 'Referrals: $100–$150',],
  },
  'Culinary/Chef': {
    levels: [
      { level: 'Entry (0–1 yr)', hourly: '$20.00–$23.00', weekly: '$800–$960', monthly: '$3,464–$4,157' },
      { level: 'Standard (1–3 yr)', hourly: '$23.00–$26.00', weekly: '$960–$1,120', monthly: '$4,157–$4,850' },
      { level: 'Senior (3+ yr)', hourly: '$26.00–$30.00', weekly: '$1,120–$1,280', monthly: '$4,850–$5,542' },
      { level: 'Executive (5+ yr)', hourly: '$30.00–$35.00', weekly: '$1,280–$1,600', monthly: '$5,542–$6,928' },
    ],
    bonuses: ['Client reviews: $30', 'Referrals: $50', 'Event success: $50'],
  },
}

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
  const payStructure = PAY_STRUCTURE[module.position]

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

            {payStructure && (
              <div className="mb-12 bg-gradient-to-br from-chm-red/5 to-chm-red/10 border border-chm-red/20 rounded-lg p-8">
                <div className="mb-8">
                  <h2 className="font-serif text-3xl text-chm-black mb-2">Compensation Structure</h2>
                  <p className="text-gray-600 text-sm">Your position: <span className="font-semibold text-chm-black">{module.position}</span></p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-chm-black mb-4">Hourly Rates by Experience Level</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {payStructure.levels.map((level, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 p-4 rounded">
                        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{level.level}</p>
                        <p className="text-2xl font-bold text-chm-red mb-3">{level.hourly}/hr</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Weekly: {level.weekly}</p>
                          <p>Monthly: {level.monthly}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {payStructure.leaveIn && (
                  <div className="mb-8 pt-6 border-t border-gray-300">
                    <h3 className="text-lg font-semibold text-chm-black mb-4">Leave-In Staff (Monthly Rate)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {payStructure.leaveIn.map((item, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-4 rounded">
                          <p className="text-xs uppercase tracking-widest text-purple-600 font-semibold mb-2">{item.level}</p>
                          <p className="text-2xl font-bold text-purple-700">{item.monthly}/month</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 p-6 rounded">
                  <h3 className="text-lg font-semibold text-chm-black mb-4">Performance Bonuses</h3>
                  <div className="space-y-2">
                    {payStructure.bonuses.map((bonus, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="text-chm-red font-bold">✓</span>
                        <span className="text-gray-700">{bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-900">
                    <strong>Mileage Reimbursement:</strong> CHM reimburses $0.56 per mile for travel between claimed shifts and service-related mileage.
                  </p>
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
