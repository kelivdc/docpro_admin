import { sql } from 'drizzle-orm'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'
import { db } from '#/db'
import type { AdminPermission } from '#/lib/mock-data'
import type { CurrentAdmin } from '#/lib/admin-types'
import { hasPermission } from '#/lib/admin-types'

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user?.id) return null
  const result = await db.execute(sql`
    SELECT a.id, a.user_id, a.level, a.permissions, u.name, u.email
    FROM "admin" a
    JOIN "user" u ON u.id = a.user_id
    WHERE a.user_id = ${session.user.id}
  `)
  if (result.rows.length === 0) return null
  const row = result.rows[0] as {
    id: string
    user_id: string
    level: string
    permissions: unknown
    name: string
    email: string
  }
  return {
    id: row.id,
    userId: row.user_id,
    level: row.level as CurrentAdmin['level'],
    permissions: (row.permissions as AdminPermission[]) || [],
    name: row.name,
    email: row.email,
  }
}

export async function requireCurrentAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin()
  if (!admin) throw new Error('Anda tidak memiliki akses untuk melakukan aksi ini')
  return admin
}

export function assertSuperAdmin(admin: CurrentAdmin | null): asserts admin is CurrentAdmin {
  if (admin?.level !== 'super') {
    throw new Error('Hanya super admin yang dapat melakukan aksi ini')
  }
}

export function assertPermission(admin: CurrentAdmin, perm: AdminPermission): void {
  if (!hasPermission(admin, perm)) {
    throw new Error('Anda tidak memiliki akses untuk melakukan aksi ini')
  }
}
