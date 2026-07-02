'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { TrainingModule, QuizQuestion } from '@/lib/types'

export default function TrainingModuleDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ name?: string; phone?: string }>
}) {
  const [paramId, setParamId] = useState('')
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

  useEffect(() => {
    async function init() {
      const p = await params
      const sp = await searchParams
      setParamId(p.id)
      setStaffName(sp.name || '')
      setStaffEmail(sp.email || '')
      setStaffPhone(sp.phone || '')
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
    setSubmitted(true)

    // Save progress
    if (staffName && staffPhone && staffEmail) {
      try {
        await fetch('/api/training/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
  staff_name: staffName,
  staff_email: staffEmail,
  staff_phone: staffPhone,
  position: module.position,
  module_id: module.id,
  quiz_score: calculatedScore,
  status: calculatedScore >= 80 ? 'completed' : 'failed',
}),
        })
      } catch (err) {
        console.error('Error saving progress:', err)
      }
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
                <div className="text-gray-600 leading-relaxed space-y-4">
  {module.content ? (
    <>
      {module.content.split('. ').map((sentence, idx) => {
        const isHeader = sentence.includes('OVERVIEW') || 
                        sentence.includes('PLANNING') || 
                        sentence.includes('PROCEDURES') ||
                        sentence.includes('STANDARDS') ||
                        sentence.includes('CONDUCT') ||
                        sentence.includes('PROTOCOLS') ||
                        sentence.includes('MANAGEMENT') ||
                        sentence.includes('EQUIPMENT') ||
                        sentence.includes('REQUIREMENTS') ||
                        sentence.includes('SCOPE') ||
                        sentence.includes('CERTIFICATION')
        
        return (
          <p key={idx} className={isHeader ? 'font-semibold text-chm-black mt-6 mb-3' : ''}>
            {sentence.trim()}{sentence.trim() && '.'}
          </p>
        )
      })}
    </>
  ) : (
    'No content available'
  )}
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

        {submitted && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-4xl">
              {passed ? '✓' : '✗'}
            </div>
            <h2 className="font-serif text-3xl text-chm-black mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
              {passed ? 'Congratulations!' : 'Not Quite There'}
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Your Score: <span className="font-bold text-chm-red">{score}%</span>
            </p>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {passed
                ? 'You have successfully completed this training module and earned your certification.'
                : 'You need 80% to pass. Review the module content and try again.'}
            </p>
            <div className="flex gap-4 justify-center">
              {!passed && (
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
              )}
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
