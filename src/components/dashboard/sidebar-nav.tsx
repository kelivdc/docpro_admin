import { Link, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  MessageSquare,
  ScrollText,
  Settings,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import type { AdminPermission } from '#/lib/mock-data'
import { useHasPermission } from '#/lib/current-admin.tsx'

export interface NavItem {
  title: string
  to: string
  icon: LucideIcon
  exact?: boolean
  permission?: AdminPermission
}

export const dashboardNavItems: NavItem[] = [
  { title: 'Overview', to: '/dashboard', icon: LayoutDashboard, exact: true },
  { title: 'Users', to: '/dashboard/users', icon: Users, permission: 'users.view' },
  { title: 'Admins', to: '/dashboard/admins', icon: ShieldCheck, permission: 'admins.view' },
  { title: 'Documents', to: '/dashboard/documents', icon: FileText, permission: 'documents.view' },
  { title: 'Query Logs', to: '/dashboard/queries', icon: MessageSquare, permission: 'queries.view' },
  { title: 'Aktivitas', to: '/dashboard/logs', icon: ScrollText, permission: 'logs.view' },
  { title: 'Settings', to: '/dashboard/settings', icon: Settings, permission: 'settings.manage' },
]

export function SidebarNav({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className={cn('flex flex-col gap-1', collapsed ? 'items-center px-2' : 'px-3')}>
      {dashboardNavItems.map((item) => (
        <NavLink key={item.to} item={item} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

function NavLink({ item, collapsed, pathname, onNavigate }: { item: NavItem; collapsed?: boolean; pathname: string; onNavigate?: () => void }) {
  const hasAccess = item.permission ? useHasPermission(item.permission) : true
  if (!hasAccess) return null

  const isActive = item.exact
    ? pathname === item.to
    : pathname.startsWith(item.to)

  const Icon = item.icon

  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.title : undefined}
      className={cn(
        'flex items-center rounded-lg text-sm font-medium transition-all',
        collapsed ? 'size-10 justify-center' : 'gap-3 px-3 py-2.5',
        isActive
          ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
          : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
      )}
    >
      <Icon className={cn('size-4 shrink-0', isActive && 'text-primary')} />
      {!collapsed && item.title}
    </Link>
  )
}
