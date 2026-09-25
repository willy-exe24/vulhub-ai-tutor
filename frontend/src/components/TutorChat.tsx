import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import type { ChatMessage } from '../lib/types'

export function TutorChat({ labId }: { labId: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'beginner' | 'technical' | 'hint'>('beginner')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.getChatHistory(labId).then(setMessages).catch((err) => setError(err.message))
  }, [labId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const question = input.trim()
    if (!question) return
    setInput('')
    setSending(true)
    setError(null)
    setMessages((prev) => [
      ...prev,
      { id: -1, lab_id: labId, role: 'user', message: question, created_at: new Date().toISOString() },
    ])
    try {
      await api.sendChatMessage(labId, question, mode)
      setMessages(await api.getChatHistory(labId))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Ask the AI Tutor</h3>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as typeof mode)}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
        >
          <option value="beginner">Beginner</option>
          <option value="technical">Technical</option>
          <option value="hint">Hint only</option>
        </select>
      </div>

      <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">Ask a question about this lab to get started.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded px-3 py-2 text-sm ${
              m.role === 'user' ? 'bg-slate-800 text-slate-100' : 'bg-emerald-950/40 text-emerald-100'
            }`}
          >
            <div className="mb-1 text-xs uppercase text-slate-500">
              {m.role === 'user' ? 'You' : 'Tutor'}
            </div>
            <p className="whitespace-pre-line">{m.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !sending && send()}
          placeholder="Why does ../ allow directory traversal?"
          className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={sending}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          Ask
        </button>
      </div>
    </div>
  )
}
