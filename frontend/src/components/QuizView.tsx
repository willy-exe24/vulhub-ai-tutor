import { useState } from 'react'
import { api } from '../lib/api'
import type { Quiz } from '../lib/types'

export function QuizView({ labId }: { labId: number }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startQuiz() {
    setLoading(true)
    setError(null)
    try {
      const q = await api.generateQuiz(labId)
      setQuiz(q)
      setAnswers(new Array(q.questions.length).fill(''))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  async function submit() {
    if (!quiz) return
    setLoading(true)
    try {
      setQuiz(await api.submitQuiz(quiz.id, answers))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const graded = quiz?.completed_at != null

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Quiz Me</h3>
        <button
          onClick={startQuiz}
          disabled={loading}
          className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Working…' : quiz ? 'New Quiz' : 'Quiz Me'}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {quiz && (
        <div className="mt-4 space-y-4">
          {graded && (
            <p className="rounded border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
              Score: {quiz.score}%
            </p>
          )}
          {quiz.questions.map((q, i) => (
            <div key={i} className="border-t border-slate-800 pt-3">
              <p className="text-sm font-medium text-slate-200">
                {i + 1}. {q.question}
              </p>

              {q.type === 'short_answer' ? (
                <input
                  disabled={graded}
                  value={answers[i] ?? ''}
                  onChange={(e) =>
                    setAnswers((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
                  }
                  className="mt-2 w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm disabled:opacity-60"
                />
              ) : (
                <div className="mt-2 space-y-1">
                  {(q.options ?? []).map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="radio"
                        disabled={graded}
                        name={`q${i}`}
                        checked={answers[i] === opt}
                        onChange={() => setAnswers((prev) => prev.map((a, idx) => (idx === i ? opt : a)))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {graded && (
                <p className={`mt-2 text-xs ${q.is_correct ? 'text-emerald-400' : 'text-red-400'}`}>
                  {q.is_correct ? '✓ Correct' : '✗ Incorrect'} — answer: {q.correct_answer}. {q.explanation}
                </p>
              )}
            </div>
          ))}

          {!graded && (
            <button
              onClick={submit}
              disabled={loading}
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Submit Answers
            </button>
          )}
        </div>
      )}
    </div>
  )
}
