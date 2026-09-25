import { cn } from "@/lib/utils"
import type { EnvStatus } from "./types"

const styles: Record<EnvStatus, { dot: string; text: string; label: string }> = {
  online: { dot: "bg-primary", text: "text-primary", label: "Online" },
  running: { dot: "bg-accent", text: "text-accent", label: "Running" },
  ready: { dot: "bg-primary", text: "text-primary", label: "Ready" },
  offline: { dot: "bg-muted-foreground", text: "text-muted-foreground", label: "Offline" },
}

export function StatusPill({
  status,
  label,
  className,
}: {
  status: EnvStatus
  label?: string
  className?: string
}) {
  const s = styles[status]
  const isLive = status !== "offline"
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", s.text, className)}>
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", s.dot)} />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
      </span>
      {label ?? s.label}
    </span>
  )
}

const difficultyStyles: Record<string, string> = {
  Beginner: "border-primary/30 bg-primary/10 text-primary",
  Intermediate: "border-accent/30 bg-accent/10 text-accent",
  Advanced: "border-destructive/40 bg-destructive/10 text-destructive",
}

export function DifficultyBadge({ level, className }: { level: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        difficultyStyles[level] ?? "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {level}
    </span>
  )
}
