import { useState } from 'react'
import { api } from '../lib/api'
import type { AiExplanation } from '../lib/types'

const SECTIONS: { key: keyof AiExplanation; title: string }[] = [
  { key: 'what_is_it', title: 'What Is This Vulnerability?' },
  { key: 'why_it_happens', title: 'Why Does It Happen?' },
  { key: 'attacker_impact', title: 'What Could an Attacker Do?' },
  { key: 'what_to_learn', title: 'What Should I Learn?' },
  { key: 'detection', title: 'How Would a Defender Detect It?' },
  { key: 'mitigation', title: 'How Is It Fixed?' },
]

export function AiExplain({ labId }: { labId: number }) {
  const [mode, setMode] = useState<'beginner' | 'technical'>('beginner')
  const [explanation, setExplanation] = useState<AiExplanation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function explain() {
    setLoading(true)
    setError(null)
    try {
      setExplanation(await api.explain(labId, mode))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-medium">AI Vulnerability Explanation</h3>
        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'beginner' | 'technical')}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
          >
            <option value="beginner">Beginner</option>
            <option value="technical">Technical</option>
          </select>
          <button
            onClick={explain}
            disabled={loading}
            className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Explaining…' : 'Explain With AI'}
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      {explanation && (
        <div className="mt-4 space-y-4">
          {explanation.stubbed && (
            <p className="rounded border border-amber-800 bg-amber-950/40 px-2 py-1 text-xs text-amber-300">
              Stub mode: configure an AI API key in Settings for real explanations.
            </p>
          )}
          {SECTIONS.map(({ key, title }) => (
            <div key={key}>
              <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-400">{explanation[key]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
