import { Link } from 'react-router-dom'
import type { Lab } from '../lib/types'

export function LabCard({ lab }: { lab: Lab }) {
  return (
    <Link
      to={`/labs/${lab.id}`}
      className="block rounded-lg border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-emerald-500/50 hover:bg-slate-900"
    >
      <div className="text-xs uppercase tracking-wide text-slate-500">{lab.product}</div>
      <div className="mt-1 font-medium text-slate-100">{lab.cve ?? lab.name}</div>
      {lab.cve && lab.name !== lab.cve && (
        <div className="mt-0.5 text-sm text-slate-400">{lab.name}</div>
      )}
      {lab.category && (
        <div className="mt-2 inline-block rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
          {lab.category}
        </div>
      )}
    </Link>
  )
}
