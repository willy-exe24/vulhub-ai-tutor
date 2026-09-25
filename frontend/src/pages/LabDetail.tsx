import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AiExplain } from '../components/AiExplain'
import { ProgressControls } from '../components/ProgressControls'
import { QuizView } from '../components/QuizView'
import { ReadmeViewer } from '../components/ReadmeViewer'
import { RunInstructions } from '../components/RunInstructions'
import { StudyNotesView } from '../components/StudyNotesView'
import { TutorChat } from '../components/TutorChat'
import { api } from '../lib/api'
import type { Lab, Progress as ProgressType } from '../lib/types'

export function LabDetail() {
  const { id } = useParams<{ id: string }>()
  const labId = Number(id)

  const [lab, setLab] = useState<Lab | null>(null)
  const [readme, setReadme] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!labId) return
    setLab(null)
    setError(null)
    Promise.all([api.getLab(labId), api.getReadme(labId), api.getProgress(labId)])
      .then(([l, r, p]) => {
        setLab(l)
        setReadme(r.content)
        setProgress(p)
      })
      .catch((err) => setError(err.message))
  }, [labId])

  if (error) {
    return <div className="mx-auto max-w-4xl px-4 py-8 text-red-400">{error}</div>
  }
  if (!lab) {
    return <div className="mx-auto max-w-4xl px-4 py-8 text-slate-400">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">{lab.product}</div>
        <h1 className="text-2xl font-semibold">{lab.cve ?? lab.name}</h1>
        {lab.cve && lab.name !== lab.cve && <p className="text-sm text-slate-400">{lab.name}</p>}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
        {lab.category && <span className="rounded bg-slate-800 px-2 py-0.5">{lab.category}</span>}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RunInstructions labId={lab.id} />
        {progress && (
          <ProgressControls labId={lab.id} progress={progress} onChange={setProgress} />
        )}
      </div>

      <div className="mt-6">
        <AiExplain labId={lab.id} />
      </div>

      <div className="mt-6">
        <TutorChat labId={lab.id} />
      </div>

      <div className="mt-6">
        <QuizView labId={lab.id} />
      </div>

      <div className="mt-6">
        <StudyNotesView labId={lab.id} />
      </div>

      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="mb-3 font-medium">README</h3>
        <ReadmeViewer content={readme} />
      </div>
    </div>
  )
}
