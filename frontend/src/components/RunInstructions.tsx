import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { RunInstructions as RunInstructionsType } from '../lib/types'

export function RunInstructions({ labId }: { labId: number }) {
  const [info, setInfo] = useState<RunInstructionsType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .getRunInstructions(labId)
      .then(setInfo)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [labId])

  if (error) return <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-red-400">{error}</div>
  if (!info) return <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-500">Loading…</div>

  const command = `cd ~/vulhub/${info.relative_path} && docker compose up -d`

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="font-medium">How to Run This Lab</h3>
      <p className="mt-1 text-xs text-slate-500">
        This app doesn't run Docker for you. On your own Ubuntu VM (with{' '}
        <a
          href="https://github.com/vulhub/vulhub"
          target="_blank"
          rel="noreferrer"
          className="text-emerald-400 hover:underline"
        >
          vulhub
        </a>{' '}
        cloned and Docker installed), then attack it from your Kali VM:
      </p>

      <div className="mt-3 space-y-3">
        <div>
          <p className="text-xs text-slate-500">Lab path within vulhub</p>
          <code className="mt-1 block rounded bg-slate-950 px-2 py-1.5 text-xs text-slate-300">
            {info.relative_path}
          </code>
        </div>

        {info.ports.length > 0 && (
          <div>
            <p className="text-xs text-slate-500">Exposes</p>
            <p className="mt-1 text-sm text-slate-300">
              {info.ports.map((p) => `${p.host_port} → ${p.container_port}/${p.protocol}`).join(', ')}
            </p>
          </div>
        )}

        <div>
          <p className="text-xs text-slate-500">Run on your Vulhub VM</p>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded bg-slate-950 px-2 py-1.5 text-xs text-emerald-300">
              {command}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(command)}
              className="shrink-0 rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-slate-500"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
