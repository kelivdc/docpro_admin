import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  MessageSquare,
  Settings,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '#/lib/utils.ts'

export interface NavItem {
  title: string
  to: string
  icon: LucideIcon
  exact?: boolean
}

export const dashboardNavItems: NavItem[] = [
  { title: 'Overview', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { title: 'Users', to: '/dashboard/users', icon: Users },
  { title: 'Admins', to: '/dashboard/admins', icon: ShieldCheck },
  { title: 'Documents', to: '/dashboard/documents', icon: FileText },
  { title: 'Query Logs', to: '/dashboard/queries', icon: MessageSquare },
  { title: 'Settings', to: '/dashboard/settings', icon: Settings },
]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="flex flex-col gap-1 px-3">
      {dashboardNavItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.to
          : pathname.startsWith(item.to)

        const Icon = item.icon

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
            )}
          >
            <Icon className={cn('size-4 shrink-0', isActive && 'text-primary')} />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
