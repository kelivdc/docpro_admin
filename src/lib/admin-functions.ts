import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { generateId } from 'better-auth'
import { hashPassword } from '@better-auth/utils/password'
import { sql } from 'drizzle-orm'
import { db } from '#/db'
import type { AdminLevel, AdminPermission } from '#/lib/mock-data'

export type AdminRecord = {
  id: string
  userId: string
  name: string
  email: string
  level: AdminLevel
  status: 'active' | 'invited' | 'revoked' | 'blocked'
  permissions: AdminPermission[]
  lastActiveAt: string | null
  createdAt: Date
  createdBy: string | null
  createdById: string | null
}

type AdminRow = {
  id: string
  user_id: string
  level: string
  status: string
  permissions: unknown
  last_active_at: Date | null
  created_at: Date
  created_by_id: string | null
  user_name: string
  user_email: string
  creator_email: string | null
}

function formatAdmin(row: AdminRow): AdminRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.user_name,
    email: row.user_email,
    level: row.level as AdminLevel,
    status: row.status as AdminRecord['status'],
    permissions: (row.permissions as AdminPermission[]) || [],
    lastActiveAt: row.last_active_at?.toISOString() ?? null,
    createdAt: row.created_at,
    createdBy: row.creator_email ?? null,
    createdById: row.created_by_id ?? null,
  }
}

export const getAdmins = createServerFn().handler(async () => {
  const result = await db.execute(sql`
    SELECT
      a.id,
      a.user_id,
      a.level,
      a.status,
      a.permissions,
      a.last_active_at,
      a.created_at,
      a.created_by_id,
      u.name AS user_name,
      u.email AS user_email,
      c.email AS creator_email
    FROM "admin" a
    JOIN "user" u ON u.id = a.user_id
    LEFT JOIN "user" c ON c.id = a.created_by_id
    ORDER BY a.created_at DESC
  `)
  return (result.rows as AdminRow[]).map(formatAdmin)
})

const idSchema = z.object({ id: z.string() })

export const deleteAdmin = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    await db.execute(sql`DELETE FROM "admin" WHERE id = ${data.id}`)
  })

const statusSchema = z.object({ id: z.string(), status: z.string() })

export const updateAdminStatus = createServerFn({ method: 'POST' })
  .validator(statusSchema)
  .handler(async ({ data }) => {
    await db.execute(
      sql`UPDATE "admin" SET status = ${data.status}, updated_at = NOW() WHERE id = ${data.id}`,
    )
  })

const levelSchema = z.object({ id: z.string(), level: z.string() })

export const updateAdminLevel = createServerFn({ method: 'POST' })
  .validator(levelSchema)
  .handler(async ({ data }) => {
    await db.execute(
      sql`UPDATE "admin" SET level = ${data.level}, updated_at = NOW() WHERE id = ${data.id}`,
    )
  })

const createAdminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  level: z.enum(['super', 'standard']),
  permissions: z.array(z.string()).default(['queries.view']),
})

export const createAdmin = createServerFn({ method: 'POST' })
  .validator(createAdminSchema)
  .handler(async ({ data }) => {
    const userId = generateId()
    const passwordHash = await hashPassword(data.password)
    const adminId = `adm_${generateId().slice(0, 6)}`

    await db.execute(sql`
      INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
      VALUES (${userId}, ${data.name}, ${data.email}, true, NOW(), NOW())
    `)
    await db.execute(sql`
      INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
      VALUES (${generateId()}, ${userId}, 'credential', ${userId}, ${passwordHash}, NOW(), NOW())
    `)
    await db.execute(sql`
      INSERT INTO "admin" (id, user_id, level, status, permissions, created_at, updated_at)
      VALUES (${adminId}, ${userId}, ${data.level}, 'active', ${JSON.stringify(data.permissions)}, NOW(), NOW())
    `)

    return { id: adminId, userId }
  })

const changePasswordSchema = z.object({
  userId: z.string(),
  password: z.string().min(8),
})

export const changeAdminPassword = createServerFn({ method: 'POST' })
  .validator(changePasswordSchema)
  .handler(async ({ data }) => {
    const passwordHash = await hashPassword(data.password)
    await db.execute(sql`
      UPDATE "account" SET password = ${passwordHash}, updated_at = NOW()
      WHERE user_id = ${data.userId} AND provider_id = 'credential'
    `)
  })

const updateProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
})

export const updateAdminProfile = createServerFn({ method: 'POST' })
  .validator(updateProfileSchema)
  .handler(async ({ data }) => {
    const admin = await db.execute(
      sql`SELECT user_id FROM "admin" WHERE id = ${data.id}`,
    )
    if (admin.rows.length === 0) throw new Error('Admin not found')
    const userId = (admin.rows[0] as { user_id: string }).user_id
    await db.execute(
      sql`UPDATE "user" SET name = ${data.name}, email = ${data.email}, updated_at = NOW() WHERE id = ${userId}`,
    )
  })

export const blockAdmin = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    const admin = await db.execute(
      sql`SELECT user_id FROM "admin" WHERE id = ${data.id}`,
    )
    if (admin.rows.length === 0) throw new Error('Admin not found')
    const userId = (admin.rows[0] as { user_id: string }).user_id
    await db.execute(
      sql`UPDATE "admin" SET status = 'blocked', updated_at = NOW() WHERE id = ${data.id}`,
    )
    await db.execute(
      sql`DELETE FROM "session" WHERE user_id = ${userId}`,
    )
  })

export const unblockAdmin = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    await db.execute(
      sql`UPDATE "admin" SET status = 'active', updated_at = NOW() WHERE id = ${data.id}`,
    )
  })
