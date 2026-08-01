import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Mail, HardDrive, Database, DollarSign, Activity, Package, CheckCircle, Sparkles, Zap, Server, FileText as FileIcon, Lock, Loader2, AlertCircle } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Avatar, AvatarFallback } from '#/components/ui/avatar.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog.tsx'
import { getUserDetail, type UserDetail, changeUserPassword } from '#/lib/user-functions.ts'
import { checkAuthSession, isAuthenticated, logout } from '#/lib/auth-session.ts'

export const Route = createFileRoute('/dashboard/profile')({
  beforeLoad: async () => {
    if (!(await isAuthenticated())) {
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    const session = await checkAuthSession()
    if (!session?.user?.id) throw new Error('Not authenticated')
    const user = await getUserDetail({ data: { id: session.user.id } })
    if (!user) throw new Error('User not found')
    return { user }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useLoaderData()
  const navigate = useNavigate()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setChangingPassword(true)
    try {
      await changeUserPassword({ data: { userId: user.id, password: newPassword } })
      setPasswordOpen(false)
      setNewPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Gagal mengubah password')
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <a href="/dashboard">
            <ArrowLeft className="size-4" />
          </a>
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={user.status} />
          <RoleBadge role={user.role} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat icon={Activity} label="Total Query" value={user.totalQueries.toLocaleString('id-ID')} />
        <MiniStat icon={Database} label="Total Token" value={user.totalTokens.toLocaleString('id-ID')} />
        <MiniStat icon={HardDrive} label="Storage" value={formatBytes(user.totalStorage)} />
        <MiniStat icon={DollarSign} label="Biaya" value={`$${user.totalCostUsd.toFixed(2)}`} />
      </div>

      <Card>
        <Tabs defaultValue="profile" className="w-full">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle>Profil Saya</CardTitle>
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="plan">Plan</TabsTrigger>
                <TabsTrigger value="documents">Dokumen</TabsTrigger>
                <TabsTrigger value="queries">Query History</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="profile" className="mt-4 space-y-4">
              <ProfileTab user={user} onChangePassword={() => setPasswordOpen(true)} onLogout={handleLogout} />
            </TabsContent>
            <TabsContent value="plan" className="mt-4">
              <PlanTab user={user} />
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <DocumentsTab user={user} />
            </TabsContent>
            <TabsContent value="queries" className="mt-4">
              <QueryHistoryTab user={user} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Masukkan password baru untuk akun Anda.
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
              <Button type="button" variant="outline" onClick={() => setPasswordOpen(false)} disabled={changingPassword}>
                Batal
              </Button>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
                {changingPassword ? 'Menyimpan...' : 'Simpan Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProfileTab({ user, onChangePassword, onLogout }: { user: UserDetail; onChangePassword: () => void; onLogout: () => void }) {
  const fields = [
    { label: 'Nama', value: user.name },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Status', value: <StatusBadge status={user.status} /> },
    { label: 'Role', value: <RoleBadge role={user.role} /> },
    { label: 'Email Terverifikasi', value: user.emailVerified ? 'Ya' : 'Tidak' },
    { label: 'Bergabung', value: formatDate(user.createdAt), icon: Calendar },
    { label: 'Terakhir Update', value: formatDate(user.updatedAt), icon: Calendar },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center gap-2 rounded-lg border p-3">
            {f.icon && <f.icon className="size-4 shrink-0 text-muted-foreground" />}
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">{f.label}</span>
              <span className="text-sm font-medium">{f.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onChangePassword}>
          <Lock className="size-4" />
          Ganti Password
        </Button>
        <Button variant="outline" onClick={onLogout}>
          Keluar
        </Button>
      </div>
    </div>
  )
}

function PlanTab({ user }: { user: UserDetail }) {
  if (!user.plan) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Anda belum memiliki plan.
      </div>
    )
  }

  const planMeta = getPlanMeta(user.plan.tier)

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm shadow-primary/10">
              <Package className="size-7" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-muted-foreground">Paket Aktif</span>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold capitalize tracking-tight">{user.plan.tier}</h3>
                <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30">Aktif</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{planMeta.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <span className="text-3xl font-bold tracking-tight">{planMeta.price}</span>
            <span className="text-sm text-muted-foreground">/bulan</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" />
              Fitur Paket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {planMeta.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="size-4 text-primary" />
              Limit & Kuota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {planMeta.limits.map((limit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{limit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="size-4 text-primary" />
            Detail Teknis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Tier', value: <Badge variant="default" className="capitalize">{user.plan.tier}</Badge> },
              { label: 'Schema', value: user.plan.schemaName ?? '-' },
              { label: 'Bucket', value: user.plan.bucket ?? '-' },
              { label: 'LLM Mode', value: user.plan.llmMode ?? '-' },
              { label: 'Org ID', value: user.plan.orgId ?? '-' },
              { label: 'Dibuat', value: user.plan.createdAt ? formatDate(user.plan.createdAt) : '-', icon: Calendar },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 rounded-lg border p-3">
                {f.icon && <f.icon className="size-4 shrink-0 text-muted-foreground" />}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">{f.label}</span>
                  <span className="text-sm font-medium">{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentsTab({ user }: { user: UserDetail }) {
  if (user.documents.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Anda belum mengunggah dokumen.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dokumen</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sumber</TableHead>
            <TableHead>Share</TableHead>
            <TableHead className="text-right">Ukuran</TableHead>
            <TableHead className="text-right">Chunks</TableHead>
            <TableHead className="text-right">Skor</TableHead>
            <TableHead>Dibuat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {user.documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileIcon className="size-4 shrink-0 text-primary" />
                  <span className="max-w-[200px] truncate text-sm font-medium">{doc.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">{doc.category ?? '-'}</TableCell>
              <TableCell><StatusBadge status={doc.status ?? ''} /></TableCell>
              <TableCell className="text-sm capitalize">{doc.sourceType ?? '-'}</TableCell>
              <TableCell className="text-sm capitalize">{doc.share ?? '-'}</TableCell>
              <TableCell className="text-right tabular-nums text-sm">{formatBytes(doc.sizeBytes)}</TableCell>
              <TableCell className="text-right tabular-nums text-sm">{doc.chunksCount.toLocaleString('id-ID')}</TableCell>
              <TableCell className="text-right tabular-nums text-sm">{doc.intelligenceScore ?? '-'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function QueryHistoryTab({ user }: { user: UserDetail }) {
  if (user.usage.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        Belum ada data query.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Chat</TableHead>
            <TableHead className="text-right">Storage</TableHead>
            <TableHead className="text-right">Prompt Tokens</TableHead>
            <TableHead className="text-right">Completion</TableHead>
            <TableHead className="text-right">Total Tokens</TableHead>
            <TableHead className="text-right">Biaya (USD)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {user.usage.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="text-sm">{row.date}</TableCell>
              <TableCell className="text-right tabular-nums">{Number(row.chatCount).toLocaleString('id-ID')}</TableCell>
              <TableCell className="text-right tabular-nums">{formatBytes(Number(row.storageBytes))}</TableCell>
              <TableCell className="text-right tabular-nums">{Number(row.promptTokens).toLocaleString('id-ID')}</TableCell>
              <TableCell className="text-right tabular-nums">{Number(row.completionTokens).toLocaleString('id-ID')}</TableCell>
              <TableCell className="text-right tabular-nums">{Number(row.totalTokens).toLocaleString('id-ID')}</TableCell>
              <TableCell className="text-right tabular-nums">${Number(row.costUsd).toFixed(4)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function getPlanMeta(tier: string) {
  const map: Record<string, { price: string; description: string; features: string[]; limits: string[] }> = {
    free: {
      price: 'Gratis',
      description: 'Paket dasar untuk eksplorasi fitur DocPro.',
      features: ['Akses dasar RAG', '1 knowledge base', 'Community support'],
      limits: ['100 query/bulan', '100 MB storage', 'Shared LLM queue'],
    },
    starter: {
      price: 'Rp 299K',
      description: 'Cocok untuk individu atau tim kecil yang mulai menggunakan AI.',
      features: ['Akses penuh RAG', '3 knowledge bases', 'Email support'],
      limits: ['1.000 query/bulan', '1 GB storage', 'Priority LLM'],
    },
    pro: {
      price: 'Rp 999K',
      description: 'Paket profesional dengan kuota besar untuk produksi.',
      features: ['Akses penuh RAG', '10 knowledge bases', 'Priority support', 'API access'],
      limits: ['10.000 query/bulan', '10 GB storage', 'Dedicated LLM'],
    },
    enterprise: {
      price: 'Custom',
      description: 'Solusi kustom dengan dukungan enterprise.',
      features: ['Unlimited knowledge bases', 'Dedicated infra', 'SLA guarantee', 'Custom integration'],
      limits: ['Unlimited query', 'Unlimited storage', 'Dedicated support'],
    },
  }

  return (
    map[tier.toLowerCase()] ?? {
      price: '-',
      description: `Paket ${tier} aktif untuk Anda.`,
      features: ['Akses sesuai konfigurasi tenant'],
      limits: ['Kuota mengikuti kontrak tenant'],
    }
  )
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
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
  return <Badge variant="outline" className={entry.className}>{entry.label}</Badge>
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

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}
