import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  MoreHorizontal,
  Upload,
  Search,
  Trash2,
  Download,
  RefreshCw,
  FileText,
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
  Tabs,
  TabsList,
  TabsTrigger,
} from '#/components/ui/tabs.tsx'
import {
  documents as initialDocs,
  type DocumentStatus,
} from '#/lib/mock-data.ts'
import { cn } from '#/lib/utils.ts'

export const Route = createFileRoute('/dashboard/documents')({
  component: DocumentsPage,
})

type StatusTab = 'all' | DocumentStatus

function DocumentsPage() {
  const [docList, setDocList] = useState(initialDocs)
  const [search, setSearch] = useState('')
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [statusTab, setStatusTab] = useState<StatusTab>('all')

  const collections = useMemo(
    () => [...new Set(docList.map((d) => d.collection))],
    [docList],
  )

  const filtered = useMemo(() => {
    return docList.filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
      const matchCollection =
        collectionFilter === 'all' || d.collection === collectionFilter
      const matchStatus = statusTab === 'all' || d.status === statusTab
      return matchSearch && matchCollection && matchStatus
    })
  }, [docList, search, collectionFilter, statusTab])

  const stats = useMemo(
    () => ({
      total: docList.length,
      ready: docList.filter((d) => d.status === 'ready').length,
      processing: docList.filter(
        (d) => d.status === 'processing' || d.status === 'queued',
      ).length,
      failed: docList.filter((d) => d.status === 'failed').length,
      totalChunks: docList.reduce((s, d) => s + d.chunks, 0),
    }),
    [docList],
  )

  function deleteDoc(id: string) {
    setDocList((prev) => prev.filter((d) => d.id !== id))
  }

  function reprocess(id: string) {
    setDocList((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'processing' as const } : d,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Dokumen</h1>
          <p className="text-sm text-muted-foreground">
            Kelola dokumen knowledge base RAG
          </p>
        </div>
        <Button>
          <Upload className="size-4" />
          Upload Dokumen
        </Button>
      </div>

      {/* Mini stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DocMiniStat
          icon={FileText}
          label="Total Dokumen"
          value={stats.total}
        />
        <DocMiniStat
          icon={FileText}
          label="Siap Dipakai"
          value={stats.ready}
          tone="emerald"
        />
        <DocMiniStat
          icon={RefreshCw}
          label="Processing"
          value={stats.processing}
          tone="amber"
        />
        <DocMiniStat
          icon={FileText}
          label="Total Chunks"
          value={stats.totalChunks}
          tone="lagoon"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Daftar Dokumen</CardTitle>
              <CardDescription>
                {filtered.length} dokumen ditampilkan
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari dokumen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-52 pl-9"
                />
              </div>
              <Select value={collectionFilter} onValueChange={setCollectionFilter}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue placeholder="Koleksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua koleksi</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs
            value={statusTab}
            onValueChange={(v) => setStatusTab(v as StatusTab)}
            className="mt-2"
          >
            <TabsList>
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="queued">Queued</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dokumen</TableHead>
                  <TableHead>Koleksi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ukuran</TableHead>
                  <TableHead className="text-right">Chunks</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Diunggah</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-bold uppercase">
                          {doc.type}
                        </div>
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.collection}
                    </TableCell>
                    <TableCell>
                      <DocStatusBadge status={doc.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {formatSize(doc.sizeKb)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {doc.chunks || '-'}
                    </TableCell>
                    <TableCell className="text-sm">{doc.owner}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.uploadedAt}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="size-4" />
                            Download
                          </DropdownMenuItem>
                          {(doc.status === 'failed' ||
                            doc.status === 'ready') && (
                            <DropdownMenuItem
                              onClick={() => reprocess(doc.id)}
                            >
                              <RefreshCw className="size-4" />
                              Reprocess
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => deleteDoc(doc.id)}
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
                      colSpan={8}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      Tidak ada dokumen yang cocok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DocMiniStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileText
  label: string
  value: number
  tone?: 'emerald' | 'amber' | 'lagoon'
}) {
  const toneClass = {
    emerald: 'text-emerald-600 bg-emerald-500/10',
    amber: 'text-amber-600 bg-amber-500/10',
    lagoon: 'text-primary bg-primary/10',
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
          <p className="text-2xl font-bold tracking-tight">
            {value.toLocaleString('id-ID')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function DocStatusBadge({ status }: { status: DocumentStatus }) {
  const map = {
    ready: {
      label: 'Ready',
      className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    },
    processing: {
      label: 'Processing',
      className: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    },
    queued: {
      label: 'Queued',
      className: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    },
    failed: {
      label: 'Failed',
      className: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    },
  }
  const { label, className } = map[status]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}

function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
