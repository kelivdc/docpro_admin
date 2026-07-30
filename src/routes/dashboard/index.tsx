import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Users as UsersIcon,
  FileText,
  MessageSquare,
  Zap,
  TrendingUp,
  TrendingDown,
  Upload,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx'
import { Badge } from '#/components/ui/badge.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Separator } from '#/components/ui/separator.tsx'
import { cn } from '#/lib/utils.ts'
import {
  statsOverview,
  activityData,
  collectionStats,
  recentActivity,
  documents,
} from '#/lib/mock-data.ts'

export const Route = createFileRoute('/dashboard/')({
  component: OverviewPage,
})

function OverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan aktivitas platform DocPro
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={statsOverview.totalUsers.toLocaleString('id-ID')}
          trend={statsOverview.activeUsersTrend}
          icon={UsersIcon}
        />
        <StatCard
          title="Total Dokumen"
          value={statsOverview.totalDocuments.toLocaleString('id-ID')}
          trend={statsOverview.documentsTrend}
          icon={FileText}
        />
        <StatCard
          title="Total Query"
          value={statsOverview.totalQueries.toLocaleString('id-ID')}
          trend={statsOverview.queriesTrend}
          icon={MessageSquare}
        />
        <StatCard
          title="Avg. Latency"
          value={`${statsOverview.avgLatencyMs} ms`}
          trend={statsOverview.latencyTrend}
          icon={Zap}
          invertTrend
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktivitas Mingguan</CardTitle>
            <CardDescription>User aktif & query per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart />
          </CardContent>
        </Card>

        {/* Collections */}
        <Card>
          <CardHeader>
            <CardTitle>Koleksi Dokumen</CardTitle>
            <CardDescription>Distribusi per kategori</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {collectionStats.map((c) => {
              const total = collectionStats.reduce((s, x) => s + x.documents, 0)
              const pct = Math.round((c.documents / total) * 100)
              return (
                <div key={c.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">
                      {c.documents.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dokumen Terbaru</CardTitle>
                <CardDescription>5 dokumen terakhir diunggah</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/documents">Lihat semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {documents.slice(0, 5).map((doc, i) => (
                <div key={doc.id}>
                  {i > 0 && <Separator className="my-0" />}
                  <div className="flex items-center gap-3 py-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold uppercase">
                      {doc.type}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {doc.owner} · {doc.uploadedAt}
                      </p>
                    </div>
                    <DocStatusBadge status={doc.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
            <CardDescription>Log aktivitas terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex gap-3">
                  <ActivityIcon type={act.type} />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm leading-snug">{act.text}</p>
                    <p className="text-xs text-muted-foreground">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  invertTrend,
}: {
  title: string
  value: string
  trend: number
  icon: LucideIcon
  invertTrend?: boolean
}) {
  const isPositive = invertTrend ? trend < 0 : trend > 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardContent className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-emerald-600' : 'text-destructive',
            )}
          >
            <TrendIcon className="size-3" />
            {Math.abs(trend)}% vs bulan lalu
          </div>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityChart() {
  const maxQueries = Math.max(...activityData.map((d) => d.queries))
  const maxUsers = Math.max(...activityData.map((d) => d.users))

  return (
    <div className="flex h-64 items-end justify-between gap-2">
      {activityData.map((d) => (
        <div
          key={d.label}
          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
        >
          <div className="flex h-full w-full items-end justify-center gap-1">
            <div
              className="group relative w-full max-w-[20px] rounded-t-md bg-primary/70 transition-colors hover:bg-primary"
              style={{ height: `${(d.users / maxUsers) * 100}%` }}
              title={`Users: ${d.users}`}
            />
            <div
              className="group relative w-full max-w-[20px] rounded-t-md bg-chart-2/70 transition-colors hover:bg-chart-2"
              style={{ height: `${(d.queries / maxQueries) * 100}%` }}
              title={`Queries: ${d.queries}`}
            />
          </div>
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function DocStatusBadge({
  status,
}: {
  status: 'processing' | 'ready' | 'failed' | 'queued'
}) {
  const map = {
    ready: { label: 'Ready', variant: 'default' as const },
    processing: { label: 'Processing', variant: 'secondary' as const },
    queued: { label: 'Queued', variant: 'outline' as const },
    failed: { label: 'Failed', variant: 'destructive' as const },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

function ActivityIcon({ type }: { type: string }) {
  const config: Record<string, { icon: LucideIcon; className: string }> = {
    upload: { icon: Upload, className: 'bg-primary/10 text-primary' },
    query: { icon: MessageSquare, className: 'bg-chart-2/15 text-chart-2' },
    user: { icon: UsersIcon, className: 'bg-emerald-500/10 text-emerald-600' },
    error: { icon: AlertTriangle, className: 'bg-destructive/10 text-destructive' },
  }
  const { icon: Icon, className } = config[type] ?? config.upload

  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg',
        className,
      )}
    >
      <Icon className="size-4" />
    </div>
  )
}
