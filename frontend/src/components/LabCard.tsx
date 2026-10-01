import { Link } from 'react-router-dom'
import type { Lab } from '../lib/types'
import { DifficultyBadge } from './dashboard/status-pill'

export function LabCard({ lab }: { lab: Lab }) {
  return (
    <Link
      to={`/labs/${lab.id}`}
      className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-emerald-500/50 hover:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs uppercase tracking-wide text-slate-500">{lab.product}</div>
        {lab.difficulty && <DifficultyBadge level={lab.difficulty} />}
      </div>
      <div className="mt-1 font-medium text-slate-100">{lab.cve ?? lab.name}</div>
      {lab.cve && lab.name !== lab.cve && (
        <div className="mt-0.5 text-sm text-slate-400">{lab.name}</div>
      )}
      {lab.description && (
        <p className="mt-2 line-clamp-3 text-sm text-slate-400">{lab.description}</p>
      )}
      {lab.category && (
        <div className="mt-auto pt-3">
          <span className="inline-block rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
            {lab.category}
          </span>
        </div>
      )}
    </Link>
  )
}
