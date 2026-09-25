import { useEffect, useState } from 'react'
import { VmSettings } from '../components/dashboard/vm-settings'
import { api } from '../lib/api'
import type { AiSettings } from '../lib/types'

export function Settings() {
  const [settings, setSettings] = useState<AiSettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getAiSettings().then(setSettings).catch((err) => setError(err.message))
  }, [])

  async function selectProvider(provider: 'openai' | 'anthropic') {
    setSaving(true)
    try {
      const updated = await api.updateAiSettings(provider)
      setSettings(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {error && (
        <div className="mt-4 rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {settings && (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-slate-300">AI Provider</h2>
            <p className="mt-1 text-sm text-slate-500">
              Which AI provider the tutor, quiz, and study-note features use.
            </p>
            <div className="mt-3 flex gap-3">
              {(['openai', 'anthropic'] as const).map((p) => {
                const configured = p === 'openai' ? settings.openai_configured : settings.anthropic_configured
                return (
                  <button
                    key={p}
                    disabled={saving}
                    onClick={() => selectProvider(p)}
                    className={`rounded border px-3 py-2 text-sm ${
                      settings.provider === p
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-700 bg-slate-900 text-slate-300'
                    }`}
                  >
                    {p === 'openai' ? 'OpenAI' : 'Anthropic'}
                    <span className="ml-2 text-xs text-slate-500">
                      {configured ? '(key configured)' : '(no key — stub mode)'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-400">
            <p>
              API keys are configured via{' '}
              <code className="rounded bg-slate-800 px-1 py-0.5">backend/.env</code> — they aren't sent
              through the browser for security. Restart the backend after changing them.
            </p>
          </div>

          <hr className="border-slate-800" />

          <VmSettings />
        </div>
      )}
    </div>
  )
}
