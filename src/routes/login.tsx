import { useState, type FormEvent } from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import {
  FileText,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from 'lucide-react'

import { authClient } from '#/lib/auth-client.ts'
import { useTheme } from '#/lib/theme.tsx'
import { Button } from '#/components/ui/button.tsx'
import { Input } from '#/components/ui/input.tsx'
import { Label } from '#/components/ui/label.tsx'
import { Separator } from '#/components/ui/separator.tsx'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: signInError } =
        await authClient.signIn.email({
          email,
          password,
        })
      if (signInError) throw new Error(signInError.message)
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.',
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setError(null)
    setLoading(true)
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('docpro_demo_session', 'true')
      }
      navigate({ to: '/dashboard' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full bg-background">
      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        className="absolute top-4 right-4 z-50"
      >
        {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
        <span className="sr-only">{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
      </Button>

      {/* Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r bg-sidebar p-12 lg:flex">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-primary/10 blur-3xl" />

        {/* Grid pattern overlay */}
        <svg
          className="pointer-events-none absolute inset-0 size-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating vector illustration */}
        <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 opacity-90">
          <svg
            width="280"
            height="280"
            viewBox="0 0 280 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            {/* Outer ring */}
            <circle cx="140" cy="140" r="130" stroke="currentColor" strokeWidth="1" opacity="0.15" />
            <circle cx="140" cy="140" r="100" stroke="currentColor" strokeWidth="1" opacity="0.2" />

            {/* Document icon center */}
            <rect x="105" y="80" width="70" height="90" rx="8" fill="currentColor" opacity="0.08" />
            <rect x="105" y="80" width="70" height="90" rx="8" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <line x1="118" y1="100" x2="162" y2="100" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <line x1="118" y1="112" x2="162" y2="112" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <line x1="118" y1="124" x2="148" y2="124" stroke="currentColor" strokeWidth="2" opacity="0.3" />

            {/* AI node connections */}
            <circle cx="140" cy="160" r="6" fill="currentColor" opacity="0.6" />
            <circle cx="80" cy="120" r="5" fill="currentColor" opacity="0.4" />
            <circle cx="200" cy="110" r="5" fill="currentColor" opacity="0.4" />
            <circle cx="90" cy="200" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="195" cy="195" r="4" fill="currentColor" opacity="0.3" />
            <circle cx="50" cy="160" r="3" fill="currentColor" opacity="0.25" />
            <circle cx="230" cy="155" r="3" fill="currentColor" opacity="0.25" />

            {/* Connection lines */}
            <line x1="140" y1="160" x2="80" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <line x1="140" y1="160" x2="200" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <line x1="140" y1="160" x2="90" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.15" />
            <line x1="140" y1="160" x2="195" y2="195" stroke="currentColor" strokeWidth="1" opacity="0.15" />
            <line x1="80" y1="120" x2="50" y2="160" stroke="currentColor" strokeWidth="1" opacity="0.1" />
            <line x1="200" y1="110" x2="230" y2="155" stroke="currentColor" strokeWidth="1" opacity="0.1" />

            {/* Small floating particles */}
            <circle cx="60" cy="60" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="220" cy="70" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="240" cy="210" r="2" fill="currentColor" opacity="0.3" />
            <circle cx="40" cy="220" r="2" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">DocPro</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>

        <div className="relative z-10 flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            RAG Platform Admin
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Kelola knowledge base
            <br />
            dengan kekuatan AI.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Dashboard terpusat untuk mengelola user, dokumen, query RAG, dan
            konfigurasi platform DocPro.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { icon: ShieldCheck, label: 'Role-based access' },
              { icon: FileText, label: 'Dokumen tracking' },
              { icon: ArrowRight, label: 'Real-time logs' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border bg-card/80 px-3 py-2 text-sm font-medium backdrop-blur-sm"
              >
                <Icon className="size-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 DocPro. Semua hak dilindungi.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="rise-in w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">DocPro</span>
          </Link>

          <div className="rounded-xl border bg-card p-8 shadow-sm">
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight">Masuk</h2>
              <p className="text-sm text-muted-foreground">
                Masuk ke dashboard admin DocPro
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@docpro.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 pr-9"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" disabled={loading} className="mt-2 w-full">
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">atau</span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <ShieldCheck className="size-4" />
              Mode Demo (tanpa auth)
            </Button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Gunakan <span className="font-medium">Mode Demo</span> untuk
            menjelajahi dashboard tanpa login.
          </p>
        </div>
      </div>
    </div>
  )
}
