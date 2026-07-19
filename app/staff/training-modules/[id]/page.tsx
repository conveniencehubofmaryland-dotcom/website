'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { TrainingModule, QuizQuestion } from '@/lib/types'

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

      // If passed, redirect to thank-you page
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

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
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
            {/* Module Content */}
            <div className="prose max-w-none mb-12">
              <div className="bg-gray-50 border border-gray-200 p-8 rounded">
                <h2 className="text-2xl font-semibold text-chm-black mb-4">Module Content</h2>
                <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {module.content || 'No content available'}
                </div>
              </div>
            </div>

            {/* Start Quiz Button */}
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
