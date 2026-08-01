import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Clock,
  Coins,
  MessageSquare,
  Zap,
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
import { Input } from '#/components/ui/input.tsx'
import { Separator } from '#/components/ui/separator.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import { Avatar, AvatarFallback } from '#/components/ui/avatar.tsx'
import {
  chatLogs,
  type ChatLog,
  type QueryFeedback,
} from '#/lib/mock-data.ts'
import { cn } from '#/lib/utils.ts'
import { requirePermissionRoute } from '#/lib/route-guards.ts'

export const Route = createFileRoute('/dashboard/queries')({
  component: QueriesPage,
  beforeLoad: async () => {
    await requirePermissionRoute('queries.view')
  },
})

type FeedbackFilter = 'all' | QueryFeedback

function QueriesPage() {
  const [logs, setLogs] = useState(chatLogs)
  const [search, setSearch] = useState('')
  const [modelFilter, setModelFilter] = useState('all')
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const models = useMemo(
    () => [...new Set(chatLogs.map((l) => l.model))],
    [],
  )

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.question.toLowerCase().includes(search.toLowerCase()) ||
        l.user.toLowerCase().includes(search.toLowerCase())
      const matchModel = modelFilter === 'all' || l.model === modelFilter
      const matchFeedback =
        feedbackFilter === 'all' || l.feedback === feedbackFilter
      return matchSearch && matchModel && matchFeedback
    })
  }, [logs, search, modelFilter, feedbackFilter])

  const stats = useMemo(
    () => ({
      total: logs.length,
      avgLatency: Math.round(
        logs.filter((l) => l.latencyMs > 0).reduce((s, l) => s + l.latencyMs, 0) /
          logs.filter((l) => l.latencyMs > 0).length,
      ),
      totalTokens: logs.reduce((s, l) => s + l.tokens, 0),
      errors: logs.filter((l) => l.status === 'error').length,
    }),
    [logs],
  )

  function setFeedback(id: string, feedback: QueryFeedback) {
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, feedback } : l)),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Query / Chat Logs</h1>
        <p className="text-sm text-muted-foreground">
          Monitor query RAG dan jawaban yang dihasilkan
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QueryStat
          icon={MessageSquare}
          label="Total Query"
          value={stats.total.toString()}
        />
        <QueryStat
          icon={Zap}
          label="Avg. Latency"
          value={`${stats.avgLatency} ms`}
        />
        <QueryStat
          icon={Coins}
          label="Total Tokens"
          value={stats.totalTokens.toLocaleString('id-ID')}
        />
        <QueryStat
          icon={AlertCircle}
          label="Errors"
          value={stats.errors.toString()}
          tone="rose"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Riwayat Query</CardTitle>
              <CardDescription>
                {filtered.length} log ditampilkan
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari query/user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-52 pl-9"
                />
              </div>
              <Select value={modelFilter} onValueChange={setModelFilter}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua model</SelectItem>
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={feedbackFilter}
                onValueChange={(v) => setFeedbackFilter(v as FeedbackFilter)}
              >
                <SelectTrigger className="h-9 w-40">
                  <SelectValue placeholder="Feedback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua feedback</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="none">No feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {filtered.map((log) => (
              <QueryCard
                key={log.id}
                log={log}
                expanded={expanded === log.id}
                onToggle={() =>
                  setExpanded((prev) => (prev === log.id ? null : log.id))
                }
                onFeedback={(f) => setFeedback(log.id, f)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="h-24 text-center text-sm text-muted-foreground">
                Tidak ada query yang cocok.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function QueryStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof MessageSquare
  label: string
  value: string
  tone?: 'rose'
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-lg',
            tone === 'rose'
              ? 'bg-rose-500/10 text-rose-600'
              : 'bg-primary/10 text-primary',
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

function QueryCard({
  log,
  expanded,
  onToggle,
  onFeedback,
}: {
  log: ChatLog
  expanded: boolean
  onToggle: () => void
  onFeedback: (f: QueryFeedback) => void
}) {
  return (
    <div className="rounded-lg border transition-colors hover:bg-accent/30">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {log.user
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{log.user}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{log.createdAt}</span>
            {log.status === 'error' && (
              <Badge variant="destructive" className="ml-1">
                Error
              </Badge>
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-sm">{log.question}</p>
          {log.answer && !expanded && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {log.answer}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {log.latencyMs || '-'} ms
            </span>
            <span className="flex items-center gap-1">
              <Coins className="size-3" />
              {log.tokens || 0}
            </span>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {log.model}
          </Badge>
        </div>
      </button>

      {expanded && log.answer && (
        <>
          <Separator />
          <div className="p-4 pl-16">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Answer
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{log.answer}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Feedback:</span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  onFeedback(
                    log.feedback === 'positive' ? 'none' : 'positive',
                  )
                }
                className={cn(
                  log.feedback === 'positive' &&
                    'border-emerald-500/40 bg-emerald-500/10 text-emerald-600',
                )}
              >
                <ThumbsUp className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  onFeedback(
                    log.feedback === 'negative' ? 'none' : 'negative',
                  )
                }
                className={cn(
                  log.feedback === 'negative' &&
                    'border-rose-500/40 bg-rose-500/10 text-rose-600',
                )}
              >
                <ThumbsDown className="size-3.5" />
              </Button>
              {log.feedback !== 'none' && (
                <Badge
                  variant="outline"
                  className={cn(
                    'ml-1',
                    log.feedback === 'positive'
                      ? 'border-emerald-500/30 text-emerald-600'
                      : 'border-rose-500/30 text-rose-600',
                  )}
                >
                  {log.feedback === 'positive' ? 'Positive' : 'Negative'}
                </Badge>
              )}
            </div>
          </div>
        </>
      )}

      {expanded && !log.answer && (
        <>
          <Separator />
          <div className="p-4 pl-16">
            <p className="text-sm text-destructive">
              Query gagal dieksekusi. Tidak ada jawaban yang dihasilkan.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
