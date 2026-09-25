import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { ProgressLab } from '@/lib/types'

function timeAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  const units: [number, string][] = [
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ]
  for (const [unitSeconds, name] of units) {
    const value = Math.floor(seconds / unitSeconds)
    if (value >= 1) return `${value} ${name}${value === 1 ? '' : 's'} ago`
  }
  return 'just now'
}

export function RecentLabs() {
  const [labs, setLabs] = useState<ProgressLab[]>([])

  useEffect(() => {
    api.listLabProgress().then((all) => setLabs(all.slice(0, 4)))
  }, [])

  return (
    <section aria-label="Recent labs" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Recent Labs</h2>
        <Link to="/progress" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {labs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No activity yet. <Link to="/labs" className="text-primary hover:underline">Browse labs</Link> to get
          started.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {labs.map((lab) => (
            <Link key={lab.lab_id} to={`/labs/${lab.lab_id}`}>
              <Card className="group cursor-pointer gap-0 border-border p-4 transition-colors hover:border-primary/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {lab.product} — {lab.cve ?? lab.lab_name}
                    </p>
                    {lab.cve && <p className="mt-0.5 font-mono text-xs text-muted-foreground">{lab.cve}</p>}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="rounded-md bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                    {lab.category ?? 'Uncategorized'}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    {lab.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {lab.latest_quiz_score != null ? `${lab.latest_quiz_score}%` : 'Completed'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-accent">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        In progress
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {timeAgo(lab.completed_at ?? lab.started_at ?? new Date().toISOString())}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
