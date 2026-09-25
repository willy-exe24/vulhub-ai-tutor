import { Bot, FlaskConical, LayoutDashboard, NotebookPen, Settings, ShieldCheck, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/labs', label: 'Labs', icon: FlaskConical },
  { to: '/tutor', label: 'AI Tutor', icon: Bot },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/notes', label: 'Study Notes', icon: NotebookPen },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Vulhub</p>
          <p className="text-xs text-muted-foreground">AI Tutor</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground ring-1 ring-sidebar-border'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-sidebar-foreground">Local Student</p>
            <p className="truncate text-xs text-muted-foreground">Authorized lab environment</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
