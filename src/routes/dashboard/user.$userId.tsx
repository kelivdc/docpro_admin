import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Mail, HardDrive, Database, DollarSign, Activity } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Avatar, AvatarFallback } from '#/components/ui/avatar.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs.tsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table.tsx'
import { getUserDetail, type UserDetail } from '#/lib/user-functions.ts'

export const Route = createFileRoute('/dashboard/user/$userId')({
  component: UserDetailPage,
  loader: async ({ params }) => {
    const user = await getUserDetail({ data: { id: params.userId } })
    if (!user) throw new Error('User not found')
    return { user }
  },
})

function UserDetailPage() {
  const { user } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard/users">
            <ArrowLeft className="size-4" />
          </Link>
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
        <CardHeader className="pb-0">
          <Tabs defaultValue="profile">
            <div className="flex items-center justify-between">
              <CardTitle>Detail User</CardTitle>
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="plan">Plan</TabsTrigger>
                <TabsTrigger value="queries">Query History</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription />
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsContent value="profile" className="mt-4 space-y-4">
              <ProfileTab user={user} />
            </TabsContent>
            <TabsContent value="plan" className="mt-4">
              <PlanTab user={user} />
            </TabsContent>
            <TabsContent value="queries" className="mt-4">
              <QueryHistoryTab user={user} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileTab({ user }: { user: UserDetail }) {
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
  )
}

function PlanTab({ user }: { user: UserDetail }) {
  if (!user.plan) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        User ini belum memiliki plan.
      </div>
    )
  }

  const fields = [
    { label: 'Tier', value: <Badge variant="default" className="capitalize">{user.plan.tier}</Badge> },
    { label: 'Schema', value: user.plan.schemaName ?? '-' },
    { label: 'Bucket', value: user.plan.bucket ?? '-' },
    { label: 'LLM Mode', value: user.plan.llmMode ?? '-' },
    { label: 'Org ID', value: user.plan.orgId ?? '-' },
    { label: 'Dibuat', value: user.plan.createdAt ? formatDate(user.plan.createdAt) : '-', icon: Calendar },
  ]

  return (
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
