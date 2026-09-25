import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { ProgressLab, ProgressSummary } from '../lib/types'

export function Progress() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [labs, setLabs] = useState<ProgressLab[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.getProgressSummary(), api.listLabProgress()])
      .then(([s, l]) => {
        setSummary(s)
        setLabs(l)
      })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Progress</h1>

      {error && (
        <div className="mt-4 rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {summary && (
        <p className="mt-2 text-sm text-slate-400">
          {summary.labs_completed} completed · {summary.labs_started} started ·{' '}
          {summary.quizzes_completed} quizzes taken
          {summary.average_quiz_score != null && ` (avg ${summary.average_quiz_score}%)`}
        </p>
      )}

      <div className="mt-6">
        {labs.length === 0 ? (
          <p className="text-sm text-slate-500">
            No activity yet.{' '}
            <Link to="/labs" className="text-emerald-400 hover:underline">
              Browse labs
            </Link>{' '}
            to get started.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase text-slate-500">
                <th className="py-2">Lab</th>
                <th className="py-2">Status</th>
                <th className="py-2">Confidence</th>
                <th className="py-2">Completed</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <tr key={lab.lab_id} className="border-b border-slate-900">
                  <td className="py-2">
                    <Link to={`/labs/${lab.lab_id}`} className="hover:text-emerald-400">
                      {lab.product} — {lab.cve ?? lab.lab_name}
                    </Link>
                  </td>
                  <td className="py-2 capitalize">{lab.status.replace('_', ' ')}</td>
                  <td className="py-2">{lab.confidence ? `${lab.confidence}/5` : '—'}</td>
                  <td className="py-2">
                    {lab.completed_at ? new Date(lab.completed_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
