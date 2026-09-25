import { Bell, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThemeCustomizer } from './theme-customizer'

export function Topbar() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  function submitSearch() {
    const term = search.trim()
    navigate(term ? `/labs?search=${encodeURIComponent(term)}` : '/labs')
  }

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background/60 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Vulhub AI Tutor</h1>
        </div>
        <p className="text-sm text-muted-foreground">Vulnerability lab library, AI tutor, and progress tracker</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
            placeholder="Search labs, CVEs…"
            aria-label="Search labs and CVEs"
            className="h-9 w-56 rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>
        <ThemeCustomizer />
      </div>
    </header>
  )
}
