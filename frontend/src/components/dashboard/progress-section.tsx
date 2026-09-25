import { CheckCircle2, Layers, ShieldAlert, Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { api } from '@/lib/api'
import type { ProgressLab, ProgressSummary } from '@/lib/types'

export function ProgressSection() {
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [labs, setLabs] = useState<ProgressLab[]>([])
  const [totalLabs, setTotalLabs] = useState(0)

  useEffect(() => {
    Promise.all([api.getProgressSummary(), api.listLabProgress()]).then(([s, l]) => {
      setSummary(s)
      setLabs(l)
      setTotalLabs(s.labs_discovered)
    })
  }, [])

  if (!summary) return null

  const cvesStudied = new Set(labs.map((l) => l.cve).filter(Boolean)).size
  const categoriesStudied = Object.keys(summary.categories_studied).length

  const stats = [
    {
      label: 'Labs completed',
      value: String(summary.labs_completed),
      hint: `of ${totalLabs} available`,
      icon: CheckCircle2,
      progress: totalLabs ? (summary.labs_completed / totalLabs) * 100 : 0,
    },
    {
      label: 'Average quiz score',
      value: summary.average_quiz_score != null ? `${summary.average_quiz_score}%` : '—',
      hint: `${summary.quizzes_completed} quizzes taken`,
      icon: Target,
      progress: summary.average_quiz_score ?? 0,
    },
    {
      label: 'CVEs studied',
      value: String(cvesStudied),
      hint: `across ${new Set(labs.map((l) => l.product)).size} products`,
      icon: ShieldAlert,
      progress: undefined,
    },
    {
      label: 'Vulnerability categories',
      value: String(categoriesStudied),
      hint: 'inferred from README keywords',
      icon: Layers,
      progress: undefined,
    },
  ]

  return (
    <section aria-label="Training progress" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Progress</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-0 border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.hint}</p>
            {typeof stat.progress === 'number' && <ProgressBar value={stat.progress} className="mt-3 h-1.5" />}
          </Card>
        ))}
      </div>
    </section>
  )
}
