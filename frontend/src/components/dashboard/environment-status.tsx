import { Bot, FlaskConical, Server, Terminal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { VmStatus } from '@/lib/types'
import { useSystemStatus } from '@/lib/useSystemStatus'
import { StatusPill } from './status-pill'
import type { EnvStatus } from './types'

function vmCard(label: string, vm: VmStatus, icon: LucideIcon) {
  return {
    label,
    detail: !vm.available ? (vm.error ?? 'vmrun unavailable') : vm.running ? 'Running' : 'Stopped',
    status: (vm.available && vm.running ? 'running' : 'offline') as EnvStatus,
    icon,
  }
}

export function EnvironmentStatus() {
  const { status, error } = useSystemStatus()
  const [labsDiscovered, setLabsDiscovered] = useState<number | null>(null)

  useEffect(() => {
    api
      .getProgressSummary()
      .then((s) => setLabsDiscovered(s.labs_discovered))
      .catch(() => setLabsDiscovered(null))
  }, [])

  const aiStatus: EnvStatus = status?.ai_configured ? 'ready' : 'offline'
  const apiStatus: EnvStatus = status ? 'online' : error ? 'offline' : 'online'

  const items = [
    {
      label: 'Backend API',
      detail: apiStatus === 'online' ? 'Reachable' : 'Unreachable',
      status: apiStatus,
      icon: Server,
    },
    {
      label: 'AI Tutor',
      detail: status
        ? `${status.ai_provider} · ${status.ai_configured ? 'key configured' : 'stub mode'}`
        : 'Checking…',
      status: aiStatus,
      icon: Bot,
    },
    {
      label: 'Vulhub Labs',
      detail: labsDiscovered != null ? `${labsDiscovered} discovered` : 'Checking…',
      status: (labsDiscovered ?? 0) > 0 ? 'ready' : 'offline',
      icon: FlaskConical,
    },
    ...(status?.kali.configured ? [vmCard('Kali VM', status.kali, Terminal)] : []),
    ...(status?.vulhub_vm.configured ? [vmCard('Vulhub VM', status.vulhub_vm, Server)] : []),
  ] as const

  return (
    <section aria-label="Environment status">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((env) => (
          <Card
            key={env.label}
            className="gap-0 border-border bg-gradient-to-b from-card to-card/40 p-4 transition-colors hover:border-primary/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60 ring-1 ring-border">
                <env.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <StatusPill status={env.status} />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">{env.label}</p>
            <p className="text-xs text-muted-foreground">{env.detail}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
