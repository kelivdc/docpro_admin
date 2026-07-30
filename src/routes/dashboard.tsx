import { useState, useEffect } from 'react'
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { Menu, Search, Bell, FileText, LogOut, User as UserIcon, Moon, Sun, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { useTheme } from '#/lib/theme.tsx'

import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Avatar, AvatarFallback } from '#/components/ui/avatar.tsx'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '#/components/ui/sheet.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx'
import { SidebarNav } from '#/components/dashboard/sidebar-nav.tsx'
import { isAuthenticated, logout } from '#/lib/auth-session.ts'
import { cn } from '#/lib/utils.ts'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    if (!(await isAuthenticated())) {
      throw redirect({ to: '/login' })
    }
  },
  component: DashboardLayout,
})

  function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const stored = localStorage.getItem('docpro_sidebar_collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleSidebar() {
    setCollapsed((c) => {
      const next = !c
      localStorage.setItem('docpro_sidebar_collapsed', String(next))
      return next
    })
  }

  async function handleLogout() {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'group/sidebar relative sticky top-0 hidden h-screen shrink-0 flex-col border-r transition-[width] duration-300 lg:flex',
          collapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {/* Gradient background base */}
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/60" />
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-12 size-64 rounded-full bg-primary/8 blur-3xl" />
        {/* Grid pattern overlay */}
        <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sidebar-grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sidebar-grid)" />
        </svg>

        <div className="relative z-10 flex h-full flex-col">
          <SidebarHeader collapsed={collapsed} />
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav collapsed={collapsed} />
          </div>
          <SidebarFooter onLogout={handleLogout} collapsed={collapsed} />
        </div>

        {/* Collapse toggle button — sits on the border */}
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Lebarkan sidebar' : 'Persempit sidebar'}
          className="absolute top-1/2 -right-3 z-30 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-all hover:bg-accent hover:text-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-3.5" />
          ) : (
            <PanelLeftClose className="size-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="relative flex h-full flex-col">
            <div className="pointer-events-none absolute -top-16 -right-12 size-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col">
              <SidebarHeader collapsed={false} />
              <div className="flex-1 overflow-y-auto py-4">
                <SidebarNav onNavigate={() => setMobileOpen(false)} collapsed={false} />
              </div>
              <SidebarFooter onLogout={handleLogout} collapsed={false} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
          <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
              <span className="sr-only">Buka menu</span>
            </Button>

          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari user, dokumen, query..."
              className="h-9 pl-9"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}>
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
              <span className="sr-only">{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
              <span className="sr-only">Notifikasi</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      AR
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">Arie Rahman</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      arie@docpro.id
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="size-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarHeader({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex h-16 items-center gap-2.5 border-b border-sidebar-border/60', collapsed ? 'justify-center px-2' : 'px-5')}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
        <FileText className="size-5" />
      </div>
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold tracking-tight">DocPro</span>
          <span className="text-xs text-muted-foreground">Admin Panel</span>
        </div>
      )}
    </div>
  )
}

function SidebarFooter({ onLogout, collapsed }: { onLogout: () => void; collapsed: boolean }) {
  return (
    <div className="border-t border-sidebar-border/60 p-3 backdrop-blur-sm">
      <div className={cn('flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-2 py-2', collapsed && 'justify-center')}>
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            AR
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="truncate text-sm font-medium">Arie Rahman</span>
              <span className="truncate text-xs text-muted-foreground">
                arie@docpro.id
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span className="sr-only">Keluar</span>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
