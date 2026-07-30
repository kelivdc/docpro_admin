export type UserStatus = 'active' | 'suspended' | 'pending'
export type UserRole = 'admin' | 'editor' | 'viewer'
export type UserPlan = 'free' | 'pro' | 'enterprise'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  plan: UserPlan
  avatarUrl?: string
  joinedAt: string
  documentsCount: number
  queriesCount: number
}

export type DocumentStatus = 'processing' | 'ready' | 'failed' | 'queued'
export type DocumentType = 'pdf' | 'docx' | 'txt' | 'md' | 'html' | 'csv'

export interface KnowledgeDocument {
  id: string
  name: string
  type: DocumentType
  sizeKb: number
  status: DocumentStatus
  owner: string
  chunks: number
  uploadedAt: string
  collection: string
}

export type QueryStatus = 'answered' | 'error' | 'streaming'
export type QueryFeedback = 'positive' | 'negative' | 'none'

export interface ChatLog {
  id: string
  question: string
  answer: string
  user: string
  model: string
  tokens: number
  latencyMs: number
  status: QueryStatus
  feedback: QueryFeedback
  createdAt: string
}

export interface StatsOverview {
  totalUsers: number
  totalDocuments: number
  totalQueries: number
  avgLatencyMs: number
  activeUsersTrend: number
  documentsTrend: number
  queriesTrend: number
  latencyTrend: number
}

export interface ActivityPoint {
  label: string
  users: number
  queries: number
}

export interface CollectionStat {
  name: string
  documents: number
  color: string
}

export const statsOverview: StatsOverview = {
  totalUsers: 1284,
  totalDocuments: 8472,
  totalQueries: 156920,
  avgLatencyMs: 1240,
  activeUsersTrend: 12.4,
  documentsTrend: 8.1,
  queriesTrend: 23.7,
  latencyTrend: -4.2,
}

export const activityData: ActivityPoint[] = [
  { label: 'Sen', users: 320, queries: 2100 },
  { label: 'Sel', users: 410, queries: 2800 },
  { label: 'Rab', users: 380, queries: 2400 },
  { label: 'Kam', users: 520, queries: 3400 },
  { label: 'Jum', users: 610, queries: 4200 },
  { label: 'Sab', users: 290, queries: 1800 },
  { label: 'Min', users: 240, queries: 1500 },
]

export const collectionStats: CollectionStat[] = [
  { name: 'Knowledge Base', documents: 3120, color: 'var(--chart-1)' },
  { name: 'Legal Docs', documents: 2180, color: 'var(--chart-2)' },
  { name: 'Manuals', documents: 1640, color: 'var(--chart-3)' },
  { name: 'Research', documents: 1532, color: 'var(--chart-4)' },
]

export const users: User[] = [
  {
    id: 'usr_01',
    name: 'Arie Rahman',
    email: 'arie@docpro.id',
    role: 'admin',
    status: 'active',
    plan: 'enterprise',
    joinedAt: '2025-11-02',
    documentsCount: 142,
    queriesCount: 3120,
  },
  {
    id: 'usr_02',
    name: 'Sari Wijaya',
    email: 'sari.wijaya@docpro.id',
    role: 'editor',
    status: 'active',
    plan: 'pro',
    joinedAt: '2025-12-14',
    documentsCount: 87,
    queriesCount: 1840,
  },
  {
    id: 'usr_03',
    name: 'Budi Santoso',
    email: 'budi.s@external.com',
    role: 'viewer',
    status: 'active',
    plan: 'free',
    joinedAt: '2026-01-08',
    documentsCount: 12,
    queriesCount: 320,
  },
  {
    id: 'usr_04',
    name: 'Maya Putri',
    email: 'maya.putri@docpro.id',
    role: 'editor',
    status: 'pending',
    plan: 'pro',
    joinedAt: '2026-02-20',
    documentsCount: 0,
    queriesCount: 0,
  },
  {
    id: 'usr_05',
    name: 'Dimas Pratama',
    email: 'dimas.p@external.com',
    role: 'viewer',
    status: 'suspended',
    plan: 'free',
    joinedAt: '2025-10-30',
    documentsCount: 34,
    queriesCount: 540,
  },
  {
    id: 'usr_06',
    name: 'Rina Kusuma',
    email: 'rina.kusuma@docpro.id',
    role: 'editor',
    status: 'active',
    plan: 'enterprise',
    joinedAt: '2025-09-12',
    documentsCount: 203,
    queriesCount: 4210,
  },
  {
    id: 'usr_07',
    name: 'Fajar Nugroho',
    email: 'fajar.n@external.com',
    role: 'viewer',
    status: 'active',
    plan: 'pro',
    joinedAt: '2026-03-01',
    documentsCount: 56,
    queriesCount: 980,
  },
  {
    id: 'usr_08',
    name: 'Lestari Dewi',
    email: 'lestari.dewi@docpro.id',
    role: 'admin',
    status: 'active',
    plan: 'enterprise',
    joinedAt: '2025-08-21',
    documentsCount: 178,
    queriesCount: 2890,
  },
]

export const documents: KnowledgeDocument[] = [
  {
    id: 'doc_01',
    name: 'Panduan Internal v3.pdf',
    type: 'pdf',
    sizeKb: 2480,
    status: 'ready',
    owner: 'Arie Rahman',
    chunks: 312,
    uploadedAt: '2026-07-24 09:14',
    collection: 'Knowledge Base',
  },
  {
    id: 'doc_02',
    name: 'Kontrak Vendor Q3.docx',
    type: 'docx',
    sizeKb: 890,
    status: 'ready',
    owner: 'Sari Wijaya',
    chunks: 84,
    uploadedAt: '2026-07-24 10:02',
    collection: 'Legal Docs',
  },
  {
    id: 'doc_03',
    name: 'Dataset Penelitian.csv',
    type: 'csv',
    sizeKb: 12400,
    status: 'processing',
    owner: 'Rina Kusuma',
    chunks: 0,
    uploadedAt: '2026-07-25 14:30',
    collection: 'Research',
  },
  {
    id: 'doc_04',
    name: 'Manual API.md',
    type: 'md',
    sizeKb: 42,
    status: 'ready',
    owner: 'Lestari Dewi',
    chunks: 18,
    uploadedAt: '2026-07-20 08:45',
    collection: 'Manuals',
  },
  {
    id: 'doc_05',
    name: 'Laporan Tahunan.pdf',
    type: 'pdf',
    sizeKb: 5600,
    status: 'failed',
    owner: 'Budi Santoso',
    chunks: 0,
    uploadedAt: '2026-07-25 16:10',
    collection: 'Knowledge Base',
  },
  {
    id: 'doc_06',
    name: 'Artikel Blog.html',
    type: 'html',
    sizeKb: 120,
    status: 'ready',
    owner: 'Fajar Nugroho',
    chunks: 9,
    uploadedAt: '2026-07-22 11:20',
    collection: 'Knowledge Base',
  },
  {
    id: 'doc_07',
    name: 'Catatan Rapat.txt',
    type: 'txt',
    sizeKb: 28,
    status: 'queued',
    owner: 'Maya Putri',
    chunks: 0,
    uploadedAt: '2026-07-26 07:05',
    collection: 'Knowledge Base',
  },
  {
    id: 'doc_08',
    name: 'Spesifikasi Produk.pdf',
    type: 'pdf',
    sizeKb: 3200,
    status: 'ready',
    owner: 'Sari Wijaya',
    chunks: 156,
    uploadedAt: '2026-07-19 13:40',
    collection: 'Manuals',
  },
]

export const chatLogs: ChatLog[] = [
  {
    id: 'qry_01',
    question: 'Apa prosedur cuti tahunan untuk karyawan baru?',
    answer:
      'Karyawan baru dengan masa kerja minimal 1 tahun berhak atas cuti tahunan 12 hari. Pengajuan dilakukan melalui HRIS minimal 7 hari sebelumnya...',
    user: 'Arie Rahman',
    model: 'gpt-4o',
    tokens: 842,
    latencyMs: 1180,
    status: 'answered',
    feedback: 'positive',
    createdAt: '2026-07-26 08:42',
  },
  {
    id: 'qry_02',
    question: 'Bagaimana cara setup API key untuk integrasi?',
    answer:
      'Buka menu Settings > API Keys, klik Generate New Key. Salin token yang muncul karena hanya ditampilkan sekali. Gunakan header Authorization: Bearer <token>...',
    user: 'Sari Wijaya',
    model: 'gpt-4o-mini',
    tokens: 410,
    latencyMs: 620,
    status: 'answered',
    feedback: 'positive',
    createdAt: '2026-07-26 08:15',
  },
  {
    id: 'qry_03',
    question: 'Jelaskan isi kontrak vendor Q3 bagian pembayaran',
    answer:
      'Berdasarkan dokumen Kontrak Vendor Q3, pembayaran dilakukan dalam 3 termin: 30% di muka, 40% setelah delivery milestone 2, dan 30% setelah...',
    user: 'Rina Kusuma',
    model: 'gpt-4o',
    tokens: 1230,
    latencyMs: 2100,
    status: 'answered',
    feedback: 'none',
    createdAt: '2026-07-26 07:50',
  },
  {
    id: 'qry_04',
    question: 'Apa perbedaan plan Free dan Pro?',
    answer: '',
    user: 'Budi Santoso',
    model: 'gpt-4o-mini',
    tokens: 0,
    latencyMs: 0,
    status: 'error',
    feedback: 'none',
    createdAt: '2026-07-25 22:30',
  },
  {
    id: 'qry_05',
    question: 'Tampilkan ringkasan laporan keuangan Q2',
    answer:
      'Laporan keuangan Q2 menunjukkan pertumbuhan revenue 18% YoY. Total pendapatan Rp 12.4M dengan margin operasional 32%. Biaya infrastruktur naik 7%...',
    user: 'Lestari Dewi',
    model: 'gpt-4o',
    tokens: 1560,
    latencyMs: 1840,
    status: 'answered',
    feedback: 'positive',
    createdAt: '2026-07-25 18:12',
  },
  {
    id: 'qry_06',
    question: 'Cara embedding dokumen PDF besar?',
    answer:
      'Untuk PDF besar (>10MB), sistem otomatis memecah menjadi chunk 1000 token dengan overlap 200. Proses berjalan async dan notifikasi dikirim saat selesai...',
    user: 'Fajar Nugroho',
    model: 'gpt-4o-mini',
    tokens: 520,
    latencyMs: 740,
    status: 'answered',
    feedback: 'negative',
    createdAt: '2026-07-25 15:45',
  },
  {
    id: 'qry_07',
    question: 'Berapa limit query harian untuk plan Enterprise?',
    answer:
      'Plan Enterprise memiliki limit 10.000 query/hari dengan rate limit 100 query/menit. Dapat ditingkatkan melalui kontak sales...',
    user: 'Arie Rahman',
    model: 'gpt-4o',
    tokens: 380,
    latencyMs: 920,
    status: 'answered',
    feedback: 'positive',
    createdAt: '2026-07-25 14:20',
  },
]

export const recentActivity = [
  { id: 'act_01', type: 'upload', text: 'Arie Rahman mengunggah Panduan Internal v3.pdf', time: '2 menit lalu' },
  { id: 'act_02', type: 'query', text: 'Sari Wijaya menjalankan 24 query', time: '15 menit lalu' },
  { id: 'act_03', type: 'user', text: 'Maya Putri mendaftar (menunggu approval)', time: '1 jam lalu' },
  { id: 'act_04', type: 'error', text: 'Laporan Tahunan.pdf gagal di-embed', time: '2 jam lalu' },
  { id: 'act_05', type: 'upload', text: 'Rina Kusuma mengunggah Dataset Penelitian.csv', time: '3 jam lalu' },
  { id: 'act_06', type: 'query', text: 'Lestari Dewi menjalankan query ringkasan keuangan', time: '5 jam lalu' },
] as const

export type AdminStatus = 'active' | 'invited' | 'revoked'
export type AdminLevel = 'super' | 'standard'
export type AdminPermission =
  | 'all'
  | 'users.manage'
  | 'documents.manage'
  | 'settings.manage'
  | 'queries.view'

export interface Admin {
  id: string
  name: string
  email: string
  level: AdminLevel
  status: AdminStatus
  permissions: AdminPermission[]
  lastActiveAt: string
  createdAt: string
  createdBy: string
}

export const admins: Admin[] = [
  {
    id: 'adm_01',
    name: 'Arie Rahman',
    email: 'arie@docpro.id',
    level: 'super',
    status: 'active',
    permissions: ['all'],
    lastActiveAt: '2026-07-26 09:14',
    createdAt: '2025-11-02',
    createdBy: 'system',
  },
  {
    id: 'adm_02',
    name: 'Lestari Dewi',
    email: 'lestari.dewi@docpro.id',
    level: 'super',
    status: 'active',
    permissions: ['all'],
    lastActiveAt: '2026-07-26 08:42',
    createdAt: '2025-08-21',
    createdBy: 'system',
  },
  {
    id: 'adm_03',
    name: 'Sari Wijaya',
    email: 'sari.wijaya@docpro.id',
    level: 'standard',
    status: 'active',
    permissions: ['users.manage', 'documents.manage', 'queries.view'],
    lastActiveAt: '2026-07-25 17:20',
    createdAt: '2025-12-14',
    createdBy: 'arie@docpro.id',
  },
  {
    id: 'adm_04',
    name: 'Rina Kusuma',
    email: 'rina.kusuma@docpro.id',
    level: 'standard',
    status: 'active',
    permissions: ['documents.manage', 'queries.view'],
    lastActiveAt: '2026-07-25 14:30',
    createdAt: '2025-09-12',
    createdBy: 'arie@docpro.id',
  },
  {
    id: 'adm_05',
    name: 'Fajar Nugroho',
    email: 'fajar.n@external.com',
    level: 'standard',
    status: 'invited',
    permissions: ['queries.view'],
    lastActiveAt: '-',
    createdAt: '2026-07-24',
    createdBy: 'lestari.dewi@docpro.id',
  },
  {
    id: 'adm_06',
    name: 'Dimas Pratama',
    email: 'dimas.p@external.com',
    level: 'standard',
    status: 'revoked',
    permissions: ['queries.view'],
    lastActiveAt: '2026-06-30 11:05',
    createdAt: '2025-10-30',
    createdBy: 'arie@docpro.id',
  },
]

export const adminPermissionLabels: Record<AdminPermission, string> = {
  all: 'Full Access',
  'users.manage': 'Kelola User',
  'documents.manage': 'Kelola Dokumen',
  'settings.manage': 'Kelola Settings',
  'queries.view': 'Lihat Query',
}
