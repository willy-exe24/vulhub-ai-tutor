import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { StudyNote } from '../lib/types'

export function StudyNotesView({ labId }: { labId: number }) {
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getStudyNotes(labId).then(setNotes).catch((err) => setError(err.message))
  }, [labId])

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const note = await api.generateStudyNotes(labId)
      setNotes((prev) => [note, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Study Notes</h3>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? 'Generating…' : 'Generate Study Notes'}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {notes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No notes yet for this lab.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="rounded border border-slate-800 bg-slate-950/50 p-3">
              <p className="mb-2 text-xs text-slate-500">
                {new Date(note.created_at).toLocaleString()}
              </p>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300">{note.content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
