import { useState } from 'react'
import { api } from '../lib/api'
import type { LabProgressStatus, Progress } from '../lib/types'

const STATUSES: LabProgressStatus[] = ['not_started', 'in_progress', 'completed']

export function ProgressControls({
  labId,
  progress,
  onChange,
}: {
  labId: number
  progress: Progress
  onChange: (progress: Progress) => void
}) {
  const [saving, setSaving] = useState(false)

  async function setStatus(status: LabProgressStatus) {
    setSaving(true)
    try {
      onChange(await api.setProgressStatus(labId, status))
    } finally {
      setSaving(false)
    }
  }

  async function setConfidence(confidence: number) {
    setSaving(true)
    try {
      onChange(await api.setConfidence(labId, confidence))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="font-medium">Your Progress</h3>
      <div className="mt-2 flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            disabled={saving}
            onClick={() => setStatus(s)}
            className={`rounded px-2.5 py-1 text-xs capitalize ${
              progress.status === s
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-xs text-slate-500">How comfortable are you with this vulnerability?</p>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              disabled={saving}
              onClick={() => setConfidence(n)}
              className={`h-7 w-7 rounded text-xs ${
                (progress.confidence ?? 0) >= n
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
