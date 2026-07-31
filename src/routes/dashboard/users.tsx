import { useState, useMemo, useEffect, useRef } from 'react'
import { createFileRoute, useLoaderData, useRouter, Link } from '@tanstack/react-router'
import { MoreHorizontal, Search, CheckCircle, Trash2, ShieldCheck, ShieldX, Loader2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx'
import { getUsers, updateUserStatus, deleteUser } from '#/lib/user-functions.ts'
import { cn } from '#/lib/utils.ts'

export const Route = createFileRoute('/dashboard/users')({
  component: UsersPage,
  loader: async () => {
    const users = await getUsers()
    return { users }
  },
})

const PAGE_SIZE = 10

function UsersPage() {
  const { users: userList } = useLoaderData({ from: Route.id })
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [busy, setBusy] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null; userName: string }>({
    open: false,
    userId: null,
    userName: '',
  })

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const prevFilterKey = useRef('')
  const filterKey = `${search}:${statusFilter}:${sortKey}:${sortDir}`
  useEffect(() => {
    if (prevFilterKey.current && prevFilterKey.current !== filterKey) {
      setPage(1)
    }
    prevFilterKey.current = filterKey
  }, [filterKey])

  const filtered = useMemo(() => {
    const f = userList.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchStatus
    })
    f.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name': return a.name.localeCompare(b.name) * dir
        case 'role': return a.role.localeCompare(b.role) * dir
        case 'status': return a.status.localeCompare(b.status) * dir
        case 'queries': return (a.totalQueries - b.totalQueries) * dir
        case 'joinedAt': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() * dir
        default: return 0
      }
    })
    return f
  }, [userList, search, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const stats = useMemo(
    () => ({
      total: userList.length,
      active: userList.filter((u) => u.status === 'active').length,
      pending: userList.filter((u) => u.status === 'pending').length,
      suspended: userList.filter((u) => u.status === 'suspended' || u.status === 'blocked').length,
    }),
    [userList],
  )

  async function handleSuspend(id: string) {
    setBusy(id)
    try {
      await updateUserStatus({ data: { id, status: 'suspended' } })
      router.invalidate()
    } finally {
      setBusy(null)
    }
  }

  async function handleActivate(id: string) {
    setBusy(id)
    try {
      await updateUserStatus({ data: { id, status: 'active' } })
      router.invalidate()
    } finally {
      setBusy(null)
    }
  }

  async function handleDelete(id: string) {
    setBusy(id)
    try {
      await deleteUser({ data: { id } })
      router.invalidate()
    } finally {
      setBusy(null)
      setDeleteDialog({ open: false, userId: null, userName: '' })
    }
  }

  function openDeleteDialog(user: typeof userList[number]) {
    setDeleteDialog({ open: true, userId: user.id, userName: user.name })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-sm text-muted-foreground">
            Kelola pengguna platform DocPro
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Total" value={stats.total} />
        <MiniStat label="Aktif" value={stats.active} tone="emerald" />
        <MiniStat label="Pending" value={stats.pending} tone="amber" />
        <MiniStat label="Suspended" value={stats.suspended} tone="rose" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Daftar User</CardTitle>
              <CardDescription>{filtered.length} user ditampilkan</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama/email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-56 pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortCol label="User" sortKey="name" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead>
                    <SortCol label="Role" sortKey="role" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead>
                    <SortCol label="Status" sortKey="status" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">
                    <SortCol label="Query" sortKey="queries" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead>
                    <SortCol label="Bergabung" sortKey="joinedAt" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {u.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <Link
                            to="/dashboard/user/$userId"
                            params={{ userId: u.id }}
                            className="text-sm font-medium hover:text-primary hover:underline"
                          >
                            {u.name}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm capitalize">{u.tier ?? '-'}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.totalQueries.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" disabled={busy === u.id}>
                            {busy === u.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="size-4" />
                            )}
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {u.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleActivate(u.id)}>
                              <CheckCircle className="size-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {u.status === 'suspended' || u.status === 'blocked' ? (
                            <DropdownMenuItem onClick={() => handleActivate(u.id)}>
                              <ShieldCheck className="size-4" />
                              Aktifkan
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleSuspend(u.id)}>
                              <ShieldX className="size-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => openDeleteDialog(u)}
                          >
                            <Trash2 className="size-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada user yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="border-t px-6 py-3">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} dari{' '}
                {filtered.length}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safePage) <= 1,
                  )
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="flex w-6 justify-center text-sm text-muted-foreground">
                          &hellip;
                        </span>
                      )}
                      <Button
                        variant={p === safePage ? 'default' : 'outline'}
                        size="icon-sm"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    </span>
                  ))}
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

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((d) => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus user <strong>{deleteDialog.userName}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, userId: null, userName: '' })}
              disabled={busy === deleteDialog.userId}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.userId && handleDelete(deleteDialog.userId)}
              disabled={busy === deleteDialog.userId}
            >
              {busy === deleteDialog.userId ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDate(d: Date) {
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

function SortCol({ label, sortKey, currentKey, dir, onClick }: { label: string; sortKey: string; currentKey: string; dir: 'asc' | 'desc'; onClick: (key: string) => void }) {
  const active = currentKey === sortKey
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      className="inline-flex cursor-pointer items-center gap-1 font-medium text-foreground hover:text-foreground/80"
    >
      {label}
      <Icon className={cn('size-3.5', active ? 'text-primary' : 'text-muted-foreground')} />
    </button>
  )
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'emerald' | 'amber' | 'rose'
}) {
  const toneClass = {
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
  }
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={cn(
            'text-2xl font-bold tracking-tight',
            tone && toneClass[tone],
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    admin: { label: 'Admin', variant: 'default' },
    editor: { label: 'Editor', variant: 'secondary' },
    viewer: { label: 'Viewer', variant: 'outline' },
  }
  const entry = map[role]
  if (!entry) return <Badge variant="outline">{role}</Badge>
  return <Badge variant={entry.variant}>{entry.label}</Badge>
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    suspended: { label: 'Suspended', className: 'bg-rose-500/10 text-rose-700 border-rose-500/20' },
    blocked: { label: 'Blocked', className: 'bg-red-500/10 text-red-700 border-red-500/20' },
  }
  const entry = map[status]
  if (!entry) return <Badge variant="outline">{status}</Badge>
  return (
    <Badge variant="outline" className={entry.className}>
      {entry.label}
    </Badge>
  )
}
