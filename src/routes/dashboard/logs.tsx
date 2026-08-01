import { useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Avatar, AvatarFallback } from '#/components/ui/avatar.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import { getAdminLogs, type AdminLogDetails } from '#/lib/admin-log-functions.ts'
import { adminActionLabels, logActionToneClass, type LogActionTone } from '#/lib/admin-log-labels.ts'
import { requirePermissionRoute } from '#/lib/route-guards.ts'

export const Route = createFileRoute('/dashboard/logs')({
  component: LogsPage,
  beforeLoad: async () => {
    await requirePermissionRoute('logs.view')
  },
})

const PAGE_SIZE = 20

function LogsPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimer = useRef<number | null>(null)

  const { data, isFetching } = useQuery({
    queryKey: ['adminLogs', page, actionFilter, debouncedSearch],
    queryFn: () =>
      getAdminLogs({
        data: {
          page,
          pageSize: PAGE_SIZE,
          action: actionFilter,
          search: debouncedSearch || undefined,
        },
      }),
    staleTime: 30_000,
  })

  const total = data?.total ?? 0
  const rows = data?.rows ?? []
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  function applySearch(value: string) {
    setSearch(value)
    if (searchTimer.current) window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Aktivitas Admin</h1>
          <p className="text-sm text-muted-foreground">
            Jejak semua aksi yang dilakukan admin pada platform
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Log Aktivitas</CardTitle>
              <CardDescription>{total} aksi tercatat</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari aktor / target..."
                  value={search}
                  onChange={(e) => applySearch(e.target.value)}
                  className="h-9 w-56 pl-9"
                />
              </div>
              <Select
                value={actionFilter}
                onValueChange={(v) => {
                  setActionFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Semua aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua aksi</SelectItem>
                  {Object.entries(adminActionLabels).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isFetching && rows.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Aktor</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatTime(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {log.actorName
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.actorName}</span>
                            <span className="text-xs text-muted-foreground">
                              {log.actorEmail}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionBadge action={log.action} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{log.targetName}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Target className="size-3" />
                            {targetTypeLabel(log.targetType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DetailList details={log.details} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        Tidak ada log yang cocok.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {total > 0 && (
          <CardFooter className="border-t px-6 py-3">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, total)} dari {total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 text-sm text-muted-foreground">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

function ActionBadge({ action }: { action: string }) {
  const meta = adminActionLabels[action]
  if (!meta) return <Badge variant="outline">{action}</Badge>
  return (
    <Badge variant="outline" className={logActionToneClass[meta.tone as LogActionTone]}>
      {meta.label}
    </Badge>
  )
}

function targetTypeLabel(t: string) {
  const map: Record<string, string> = {
    admin: 'Admin',
    user: 'User',
    system: 'System',
  }
  return map[t] ?? t
}

function DetailList({ details }: { details: AdminLogDetails | null }) {
  if (!details) {
    return <span className="text-xs text-muted-foreground">-</span>
  }
  const entries = Object.entries(details)
  return (
    <div className="flex max-w-[260px] flex-wrap gap-1">
      {entries.map(([k, v]) => (
        <Badge key={k} variant="secondary" className="text-[10px]">
          {k}: {String(v)}
        </Badge>
      ))}
    </div>
  )
}

function formatTime(d: Date | string) {
  return new Date(d).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
