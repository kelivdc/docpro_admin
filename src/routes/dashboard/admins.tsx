import { useState, useMemo, type FormEvent } from 'react'
import { createFileRoute, useLoaderData, useRouter } from '@tanstack/react-router'
import {
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Mail,
  Crown,
  Loader2,
  User as UserIcon,
  AlertCircle,
  KeyRound,
  TriangleAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Ban,
  Unlock,
  Pencil,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
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
  DialogTrigger,
} from '#/components/ui/dialog.tsx'
import { Label } from '#/components/ui/label.tsx'
import { getAdmins, deleteAdmin, createAdmin, changeAdminPassword, blockAdmin, unblockAdmin, updateAdminProfile } from '#/lib/admin-functions.ts'
import { adminPermissionLabels, type AdminLevel } from '#/lib/mock-data.ts'
import { cn } from '#/lib/utils.ts'

export const Route = createFileRoute('/dashboard/admins')({
  component: AdminsPage,
  loader: async () => {
    const admins = await getAdmins()
    return { admins }
  },
})

function AdminsPage() {
  const { admins: adminList } = useLoaderData({ from: Route.id })
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<string>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [busy, setBusy] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createLevel, setCreateLevel] = useState<'super' | 'standard'>('standard')
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setCreateError(null)
    setCreating(true)
    try {
      await createAdmin({
        data: {
          name: createName,
          email: createEmail,
          password: createPassword,
          level: createLevel,
          permissions: createLevel === 'super' ? ['all'] : ['documents.manage', 'queries.view'],
        },
      })
      setCreateOpen(false)
      setCreateName('')
      setCreateEmail('')
      setCreatePassword('')
      setCreateLevel('standard')
      router.invalidate()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Gagal membuat admin')
    } finally {
      setCreating(false)
    }
  }

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const f = adminList.filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || a.status === statusFilter
      return matchSearch && matchStatus
    })
    f.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      switch (sortKey) {
        case 'name': return a.name.localeCompare(b.name) * dir
        case 'level': return a.level.localeCompare(b.level) * dir
        case 'status': return a.status.localeCompare(b.status) * dir
        case 'lastActiveAt': {
          const x = a.lastActiveAt ?? ''
          const y = b.lastActiveAt ?? ''
          return x.localeCompare(y) * dir
        }
        default: return 0
      }
    })
    return f
  }, [adminList, search, statusFilter, sortKey, sortDir])

  const stats = useMemo(
    () => ({
      total: adminList.length,
      super: adminList.filter((a) => a.level === 'super').length,
      active: adminList.filter((a) => a.status === 'active').length,
      invited: adminList.filter((a) => a.status === 'invited').length,
    }),
    [adminList],
  )

  const [passwordAdmin, setPasswordAdmin] = useState<{ id: string; userId: string; name: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const [editTarget, setEditTarget] = useState<{ id: string; name: string; email: string } | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  async function handleEditProfile(e: FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setEditError(null)
    setSavingEdit(true)
    try {
      await updateAdminProfile({ data: { id: editTarget.id, name: editName, email: editEmail } })
      setEditTarget(null)
      router.invalidate()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Gagal mengupdate profil')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (!passwordAdmin) return
    setPasswordError(null)
    setChangingPassword(true)
    try {
      await changeAdminPassword({ data: { userId: passwordAdmin.userId, password: newPassword } })
      setPasswordAdmin(null)
      setNewPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Gagal mengubah password')
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleDelete(id: string) {
    setBusy(id)
    try {
      await deleteAdmin({ data: { id } })
      router.invalidate()
    } finally {
      setBusy(null)
    }
  }

  async function handleBlock(id: string) {
    setBusy(id)
    try {
      await blockAdmin({ data: { id } })
      router.invalidate()
    } finally {
      setBusy(null)
    }
  }

  async function handleUnblock(id: string) {
    setBusy(id)
    try {
      await unblockAdmin({ data: { id } })
      router.invalidate()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Admins</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akses administrator platform DocPro
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Admin</DialogTitle>
              <DialogDescription>
                Buat akun admin baru dengan email dan password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-name">Nama</Label>
                <div className="relative">
                  <UserIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="create-name"
                    placeholder="Nama lengkap"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="admin@docpro.id"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Min. 8 karakter"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-level">Level</Label>
                <Select
                  value={createLevel}
                  onValueChange={(v) => setCreateLevel(v as 'super' | 'standard')}
                >
                  <SelectTrigger id="create-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="super">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {createError && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
              <DialogFooter className="mt-2">
                <Button type="submit" disabled={creating}>
                  {creating ? <Loader2 className="size-4 animate-spin" /> : null}
                  {creating ? 'Membuat...' : 'Buat Admin'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMiniStat
          icon={Shield}
          label="Total Admin"
          value={stats.total}
        />
        <AdminMiniStat
          icon={Crown}
          label="Super Admin"
          value={stats.super}
          tone="amber"
        />
        <AdminMiniStat
          icon={ShieldCheck}
          label="Aktif"
          value={stats.active}
          tone="emerald"
        />
        <AdminMiniStat
          icon={Mail}
          label="Invited"
          value={stats.invited}
          tone="blue"
        />
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <ShieldOff className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
            Perhatian
          </p>
          <p className="text-sm text-muted-foreground">
            Super admin memiliki akses penuh ke semua fitur termasuk menghapus
            admin lain. Pastikan hanya memberikan kepercayaan kepada orang yang
            tepat.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Daftar Admin</CardTitle>
              <CardDescription>
                {filtered.length} admin ditampilkan
              </CardDescription>
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
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
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
                    <SortHeader label="Admin" sortKey="name" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Level" sortKey="level" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead>
                    <SortHeader label="Status" sortKey="status" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>
                    <SortHeader label="Aktivitas Terakhir" sortKey="lastActiveAt" currentKey={sortKey} dir={sortDir} onClick={toggleSort} />
                  </TableHead>
                  <TableHead>Dibuat Oleh</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {a.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{a.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {a.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <LevelBadge level={a.level} />
                    </TableCell>
                    <TableCell>
                      <AdminStatusBadge status={a.status} />
                    </TableCell>
                    <TableCell>
                      <PermissionList permissions={a.permissions} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.lastActiveAt ?? '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.createdBy === null ? (
                        <Badge variant="outline" className="font-mono text-[10px]">
                          system
                        </Badge>
                      ) : (
                        a.createdBy
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" disabled={busy === a.id}>
                            {busy === a.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="size-4" />
                            )}
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditTarget({ id: a.id, name: a.name, email: a.email }); setEditName(a.name); setEditEmail(a.email); setEditError(null) }}>
                            <Pencil className="size-4" />
                            Edit Profil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPasswordAdmin({ id: a.id, userId: a.userId, name: a.name })}>
                            <KeyRound className="size-4" />
                            Ganti Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {a.status === 'blocked' ? (
                            <DropdownMenuItem onClick={() => handleUnblock(a.id)}>
                              <Unlock className="size-4" />
                              Unblock
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={a.level === 'super'}
                              onClick={() => handleBlock(a.id)}
                            >
                              <Ban className="size-4" />
                              Block
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={a.level === 'super'}
                            onClick={() => setDeleteTarget({ id: a.id, name: a.name })}
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
                      Tidak ada admin yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Edit Profile Dialog */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => { if (!open) { setEditTarget(null); setEditError(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profil Admin</DialogTitle>
            <DialogDescription>
              Ubah nama dan email untuk admin ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            {editError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? <Loader2 className="size-4 animate-spin" /> : null}
                {savingEdit ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordAdmin !== null} onOpenChange={(open) => { if (!open) { setPasswordAdmin(null); setNewPassword(''); setPasswordError(null) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Ubah password untuk <span className="font-medium">{passwordAdmin?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min. 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {passwordError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
                {changingPassword ? 'Menyimpan...' : 'Simpan Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Admin</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus admin <span className="font-medium">{deleteTarget?.name}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Admin yang dihapus tidak akan bisa masuk lagi ke dashboard ini.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={busy === deleteTarget?.id}
              onClick={async () => {
                if (!deleteTarget) return
                await handleDelete(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              {busy === deleteTarget?.id ? <Loader2 className="size-4 animate-spin" /> : null}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SortHeader({ label, sortKey, currentKey, dir, onClick }: { label: string; sortKey: string; currentKey: string; dir: 'asc' | 'desc'; onClick: (key: string) => void }) {
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

function AdminMiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Shield
  label: string
  value: number
  tone?: 'emerald' | 'amber' | 'blue'
}) {
  const toneClass = {
    emerald: 'bg-emerald-500/10 text-emerald-600',
    amber: 'bg-amber-500/10 text-amber-600',
    blue: 'bg-blue-500/10 text-blue-600',
  }
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-lg',
            tone ? toneClass[tone] : 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LevelBadge({ level }: { level: AdminLevel }) {
  if (level === 'super') {
    return (
      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-700">
        <Crown className="size-3" />
        Super
      </Badge>
    )
  }
  return <Badge variant="secondary">Standard</Badge>
}

function AdminStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: {
      label: 'Active',
      className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    },
    invited: {
      label: 'Invited',
      className: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    },
    blocked: {
      label: 'Blocked',
      className: 'bg-red-500/10 text-red-700 border-red-500/20',
    },
    revoked: {
      label: 'Revoked',
      className: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    },
  }
  const entry = map[status]
  if (!entry) return <Badge variant="outline">{status}</Badge>
  return (
    <Badge variant="outline" className={entry.className}>
      {entry.label}
    </Badge>
  )
}

function PermissionList({ permissions }: { permissions: string[] }) {
  if (permissions.includes('all')) {
    return (
      <Badge className="border-primary/30 bg-primary/10 text-primary">
        Full Access
      </Badge>
    )
  }
  return (
    <div className="flex flex-wrap gap-1">
      {permissions.map((p) => (
        <Badge key={p} variant="outline" className="text-[10px]">
          {adminPermissionLabels[p as keyof typeof adminPermissionLabels] ?? p}
        </Badge>
      ))}
    </div>
  )
}
