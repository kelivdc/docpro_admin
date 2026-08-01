import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Check, KeyRound, Database, Bot, Shield } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import { Switch } from '#/components/ui/switch.tsx'
import { Separator } from '#/components/ui/separator.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select.tsx'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#/components/ui/tabs.tsx'
import { Slider } from '#/components/ui/slider.tsx'
import { requirePermissionRoute } from '#/lib/route-guards.ts'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
  beforeLoad: async () => {
    await requirePermissionRoute('settings.manage')
  },
})

function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Konfigurasi platform DocPro
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">
            <Bot className="size-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="embedding">
            <Database className="size-4" />
            Embedding
          </TabsTrigger>
          <TabsTrigger value="api">
            <KeyRound className="size-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="size-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <GeneralSettings />
        </TabsContent>
        <TabsContent value="embedding" className="mt-4">
          <EmbeddingSettings />
        </TabsContent>
        <TabsContent value="api" className="mt-4">
          <ApiKeysSettings />
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function GeneralSettings() {
  const [modelName, setModelName] = useState('gpt-4o')
  const [temperature, setTemperature] = useState(20)
  const [maxTokens, setMaxTokens] = useState('4096')
  const [systemPrompt, setSystemPrompt] = useState(
    'Anda adalah asisten DocPro yang membantu menjawab pertanyaan berdasarkan dokumen knowledge base. Jawab dengan akurat dan ringkas dalam Bahasa Indonesia.',
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurasi LLM</CardTitle>
        <CardDescription>
          Pengaturan model bahasa untuk generasi jawaban
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="model">Model</Label>
            <Select value={modelName} onValueChange={setModelName}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                <SelectItem value="claude-3.5-sonnet">
                  claude-3.5-sonnet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="max-tokens">Max Tokens</Label>
            <Input
              id="max-tokens"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Temperature</Label>
            <span className="text-sm font-medium tabular-nums">
              {(temperature / 10).toFixed(1)}
            </span>
          </div>
          <Slider
            value={[temperature]}
            onValueChange={(v) => setTemperature(v[0] ?? 20)}
            min={0}
            max={100}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            Nilai rendah = jawaban lebih deterministik. Nilai tinggi = lebih
            kreatif.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="system-prompt">System Prompt</Label>
          <textarea
            id="system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="field-sizing-content w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <SaveBar />
      </CardContent>
    </Card>
  )
}

function EmbeddingSettings() {
  const [provider, setProvider] = useState('openai')
  const [model, setModel] = useState('text-embedding-3-small')
  const [chunkSize, setChunkSize] = useState(1000)
  const [overlap, setOverlap] = useState(200)
  const [reindexOnUpdate, setReindexOnUpdate] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konfigurasi Embedding</CardTitle>
        <CardDescription>
          Pengaturan vectorisasi dokumen untuk retrieval
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
                <SelectItem value="local">Local (Ollama)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Embedding Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-embedding-3-small">
                  text-embedding-3-small
                </SelectItem>
                <SelectItem value="text-embedding-3-large">
                  text-embedding-3-large
                </SelectItem>
                <SelectItem value="text-embedding-ada-002">
                  text-embedding-ada-002
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Chunk Size</Label>
            <span className="text-sm font-medium tabular-nums">
              {chunkSize} tokens
            </span>
          </div>
          <Slider
            value={[chunkSize]}
            onValueChange={(v) => setChunkSize(v[0] ?? 1000)}
            min={200}
            max={2000}
            step={100}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Chunk Overlap</Label>
            <span className="text-sm font-medium tabular-nums">
              {overlap} tokens
            </span>
          </div>
          <Slider
            value={[overlap]}
            onValueChange={(v) => setOverlap(v[0] ?? 200)}
            min={0}
            max={500}
            step={50}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Label>Re-index otomatis</Label>
            <p className="text-xs text-muted-foreground">
              Re-embed dokumen saat konten diperbarui
            </p>
          </div>
          <Switch
            checked={reindexOnUpdate}
            onCheckedChange={setReindexOnUpdate}
          />
        </div>

        <SaveBar />
      </CardContent>
    </Card>
  )
}

function ApiKeysSettings() {
  const [openaiKey, setOpenaiKey] = useState('sk-••••••••••••••••••••••••3Xa2')
  const [dbUrl] = useState('postgres://docpro:••••••••@vps-nexonace:5433/docpro')

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Key</CardTitle>
          <CardDescription>
            Digunakan untuk LLM dan embedding model
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="openai-key">API Key</Label>
            <Input
              id="openai-key"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
            />
          </div>
          <SaveBar />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Connection</CardTitle>
          <CardDescription>
            Koneksi PostgreSQL (read-only, dari .env.local)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Label htmlFor="db-url">DATABASE_URL</Label>
          <Input id="db-url" value={dbUrl} readOnly className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground">
            Dikelola via variabel lingkungan. Ubah di file{' '}
            <code>.env.local</code> lalu restart server.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SecuritySettings() {
  const [requireApproval, setRequireApproval] = useState(true)
  const [rateLimit, setRateLimit] = useState(true)
  const [auditLog, setAuditLog] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('30')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keamanan & Akses</CardTitle>
        <CardDescription>
          Kontrol keamanan dan kebijakan akses
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Label>Approval user baru</Label>
            <p className="text-xs text-muted-foreground">
              Admin harus approve registrasi user baru
            </p>
          </div>
          <Switch
            checked={requireApproval}
            onCheckedChange={setRequireApproval}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Label>Rate limiting</Label>
            <p className="text-xs text-muted-foreground">
              Batasi 100 query/menit per user
            </p>
          </div>
          <Switch checked={rateLimit} onCheckedChange={setRateLimit} />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <Label>Audit log</Label>
            <p className="text-xs text-muted-foreground">
              Catat semua aksi admin untuk kepatuhan
            </p>
          </div>
          <Switch checked={auditLog} onCheckedChange={setAuditLog} />
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Label>Session Timeout (menit)</Label>
          <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 menit</SelectItem>
              <SelectItem value="30">30 menit</SelectItem>
              <SelectItem value="60">1 jam</SelectItem>
              <SelectItem value="240">4 jam</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SaveBar />
      </CardContent>
    </Card>
  )
}

function SaveBar() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      {saved && (
        <span className="flex items-center gap-1 text-sm text-emerald-600">
          <Check className="size-4" />
          Tersimpan
        </span>
      )}
      <Button variant="outline">Batal</Button>
      <Button
        onClick={() => {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }}
      >
        Simpan Perubahan
      </Button>
    </div>
  )
}
