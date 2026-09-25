import { Bot } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { ProgressLab } from '@/lib/types'

export function TutorHome() {
  const [labs, setLabs] = useState<ProgressLab[]>([])

  useEffect(() => {
    api.listLabProgress().then(setLabs)
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">AI Tutor</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        The tutor is contextual to a lab — pick one below, or start a lab from the browser, to chat.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {labs.map((lab) => (
          <Link key={lab.lab_id} to={`/labs/${lab.lab_id}`}>
            <Card className="gap-0 border-border p-4 transition-colors hover:border-primary/30">
              <p className="text-sm font-semibold text-foreground">{lab.product} — {lab.cve ?? lab.lab_name}</p>
              <p className="mt-1 text-xs text-muted-foreground capitalize">{lab.status.replace('_', ' ')}</p>
            </Card>
          </Link>
        ))}
      </div>

      {labs.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          No labs in progress yet.{' '}
          <Link to="/labs" className="text-primary hover:underline">
            Browse labs
          </Link>{' '}
          to get started.
        </p>
      )}
    </div>
  )
}
