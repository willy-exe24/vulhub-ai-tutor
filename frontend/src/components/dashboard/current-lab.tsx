import { Bot, BookOpen, Network, Server, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import type { Lab, ProgressLab, RunInstructions } from '@/lib/types'
import { DifficultyBadge, StatusPill } from './status-pill'

function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

function MetaItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Server
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={cn('mt-1 truncate text-sm font-semibold text-foreground', mono && 'font-mono')}>{value}</p>
    </div>
  )
}

export function CurrentLab() {
  const navigate = useNavigate()
  const [entry, setEntry] = useState<ProgressLab | null | undefined>(undefined)
  const [lab, setLab] = useState<Lab | null>(null)
  const [instructions, setInstructions] = useState<RunInstructions | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    api
      .listLabProgress()
      .then((all) => {
        const inProgress = all.find((p) => p.status === 'in_progress') ?? null
        setEntry(inProgress)
      })
      .catch(() => setEntry(null))
  }, [])

  useEffect(() => {
    if (!entry) return
    Promise.all([api.getLab(entry.lab_id), api.getRunInstructions(entry.lab_id)]).then(([l, i]) => {
      setLab(l)
      setInstructions(i)
    })
  }, [entry])

  useEffect(() => {
    if (!entry?.started_at) return
    const startedMs = new Date(entry.started_at).getTime()
    const tick = () => setElapsed((Date.now() - startedMs) / 1000)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [entry])

  if (entry === undefined) {
    return (
      <Card className="gap-0 border-border p-5 text-sm text-muted-foreground">Loading current lab…</Card>
    )
  }

  if (entry === null || !lab) {
    return (
      <Card className="gap-0 border-border p-5">
        <p className="text-sm font-medium text-foreground">No lab in progress</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Mark a lab as "in progress" to see it here.
        </p>
        <Link to="/labs">
          <Button className="mt-3" variant="secondary">
            Browse Labs
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="gap-0 overflow-hidden border-border p-0">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Lab</span>
              <StatusPill status="running" label="In Progress" />
            </div>
            <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-foreground">
              {lab.product} — {lab.cve ?? lab.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {lab.cve && (
                <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-foreground">
                  {lab.cve}
                </span>
              )}
              {lab.category && (
                <span className="rounded-md bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                  {lab.category}
                </span>
              )}
              {entry.confidence && <DifficultyBadge level={`Confidence ${entry.confidence}/5`} />}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
        <MetaItem
          icon={Network}
          label="Ports (once running)"
          value={instructions?.ports.length ? instructions.ports.map((p) => p.host_port).join(', ') : '—'}
          mono
        />
        <MetaItem icon={Timer} label="Time Since Started" value={entry.started_at ? formatElapsed(elapsed) : '—'} mono />
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-2 p-5">
        <Button variant="secondary" onClick={() => navigate(`/labs/${lab.id}`)}>
          <Bot className="h-4 w-4" />
          Ask AI Tutor
        </Button>
        <Button variant="outline" onClick={() => navigate(`/labs/${lab.id}`)}>
          <BookOpen className="h-4 w-4" />
          View README &amp; Run Instructions
        </Button>
      </div>
    </Card>
  )
}
