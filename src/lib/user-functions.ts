import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { sql } from 'drizzle-orm'
import { db } from '#/db'

export type UserStatus = 'active' | 'pending' | 'suspended' | 'blocked'
export type UserRole = 'viewer' | 'editor' | 'admin'

export type UserRecord = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  status: UserStatus
  role: UserRole
  tier: string | null
  totalQueries: number
  totalTokens: number
  createdAt: Date
}

type UserRow = {
  id: string
  name: string
  email: string
  email_verified: boolean
  status: string
  role: string
  tier: string | null
  total_queries: number
  total_tokens: number
  created_at: Date
}

function formatUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.email_verified,
    status: row.status as UserStatus,
    role: row.role as UserRole,
    tier: row.tier,
    totalQueries: Number(row.total_queries),
    totalTokens: Number(row.total_tokens),
    createdAt: row.created_at,
  }
}

export const getUsers = createServerFn().handler(async () => {
  const result = await db.execute(sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u.email_verified,
      u.status,
      u.role,
      u.created_at,
      t.tier,
      COALESCE(SUM(ug.chat_count), 0)::int AS total_queries,
      COALESCE(SUM(ug.total_tokens), 0)::int AS total_tokens
    FROM "user" u
    LEFT JOIN "tenant_map" t ON t.user_id = u.id
    LEFT JOIN "usage" ug ON ug.user_id = u.id
    GROUP BY u.id, u.name, u.email, u.email_verified, u.status, u.role, u.created_at, t.tier
    ORDER BY u.created_at DESC
  `)
  return (result.rows as UserRow[]).map(formatUser)
})

const userIdSchema = z.object({ id: z.string() })

export const getUserDetail = createServerFn()
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const userResult = await db.execute(sql`
      SELECT
        u.id, u.name, u.email, u.email_verified, u.image,
        u.status, u.role, u.created_at, u.updated_at,
        t.tier, t.schema_name, t.bucket, t.llm_mode, t.org_id,
        t.created_at AS plan_created_at
      FROM "user" u
      LEFT JOIN "tenant_map" t ON t.user_id = u.id
      WHERE u.id = ${data.id}
    `)
    if (userResult.rows.length === 0) return null
    const row = userResult.rows[0] as {
      id: string; name: string; email: string; email_verified: boolean
      image: string | null; status: string; role: string
      created_at: Date; updated_at: Date
      tier: string | null; schema_name: string | null; bucket: string | null
      llm_mode: string | null; org_id: string | null; plan_created_at: Date | null
    }

    const usageResult = await db.execute(sql`
      SELECT
        date, chat_count, storage_bytes,
        prompt_tokens, completion_tokens, total_tokens,
        cost_usd, cost_idr
      FROM "usage"
      WHERE user_id = ${data.id}
      ORDER BY date DESC
      LIMIT 100
    `)

    const aggResult = await db.execute(sql`
      SELECT
        COALESCE(SUM(chat_count), 0)::int AS total_queries,
        COALESCE(SUM(total_tokens), 0)::int AS total_tokens,
        COALESCE(SUM(storage_bytes), 0)::bigint AS total_storage,
        COALESCE(SUM(cost_usd), 0)::real AS total_cost_usd
      FROM "usage"
      WHERE user_id = ${data.id}
    `)

    const agg = aggResult.rows[0] as { total_queries: number; total_tokens: number; total_storage: number; total_cost_usd: number }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      emailVerified: row.email_verified,
      image: row.image,
      status: row.status as UserStatus,
      role: row.role as UserRole,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      plan: row.tier
        ? {
            tier: row.tier,
            schemaName: row.schema_name,
            bucket: row.bucket,
            llmMode: row.llm_mode,
            orgId: row.org_id,
            createdAt: row.plan_created_at,
          }
        : null,
      usage: usageResult.rows.map((r: any) => ({
        date: r.date,
        chatCount: Number(r.chat_count),
        storageBytes: Number(r.storage_bytes),
        promptTokens: Number(r.prompt_tokens),
        completionTokens: Number(r.completion_tokens),
        totalTokens: Number(r.total_tokens),
        costUsd: Number(r.cost_usd),
        costIdr: Number(r.cost_idr),
      })),
      totalQueries: Number(agg.total_queries),
      totalTokens: Number(agg.total_tokens),
      totalStorage: Number(agg.total_storage),
      totalCostUsd: Number(agg.total_cost_usd),
    }
  })

export type UserDetail = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  status: UserStatus
  role: UserRole
  createdAt: Date
  updatedAt: Date
  plan: {
    tier: string
    schemaName: string | null
    bucket: string | null
    llmMode: string | null
    orgId: string | null
    createdAt: Date | null
  } | null
  usage: Array<{
    date: string
    chatCount: number
    storageBytes: number
    promptTokens: number
    completionTokens: number
    totalTokens: number
    costUsd: number
    costIdr: number
  }>
  totalQueries: number
  totalTokens: number
  totalStorage: number
  totalCostUsd: number
}

export const deleteUser = createServerFn({ method: 'POST' })
  .validator(userIdSchema)
  .handler(async ({ data }) => {
    await db.execute(sql`DELETE FROM "user" WHERE id = ${data.id}`)
  })

const statusSchema = z.object({ id: z.string(), status: z.string() })

export const updateUserStatus = createServerFn({ method: 'POST' })
  .validator(statusSchema)
  .handler(async ({ data }) => {
    await db.execute(
      sql`UPDATE "user" SET status = ${data.status}, updated_at = NOW() WHERE id = ${data.id}`,
    )
  })
