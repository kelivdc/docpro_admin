import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { sql, type SQL } from 'drizzle-orm'
import { db } from '#/db'
import { requireCurrentAdmin, assertPermission } from '#/lib/admin-auth'

export type AdminLogDetails = Record<string, string | number | boolean | Array<string | number> | null>

export type AdminLogRecord = {
  id: string
  actorUserId: string
  actorName: string
  actorEmail: string
  actorLevel: string
  action: string
  targetType: string
  targetId: string
  targetName: string
  details: AdminLogDetails | null
  createdAt: Date
}

type LogRow = {
  id: string
  actor_user_id: string
  actor_name: string
  actor_email: string
  actor_level: string
  action: string
  target_type: string
  target_id: string
  target_name: string
  details: unknown
  created_at: Date
}

function formatLog(row: LogRow): AdminLogRecord {
  return {
    id: row.id,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    actorEmail: row.actor_email,
    actorLevel: row.actor_level,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    targetName: row.target_name,
    details: (row.details as AdminLogDetails | null) ?? null,
    createdAt: row.created_at,
  }
}

const getLogsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  action: z.string().optional(),
  search: z.string().optional(),
})

export const getAdminLogs = createServerFn()
  .validator(getLogsSchema)
  .handler(async ({ data }) => {
    const current = await requireCurrentAdmin()
    assertPermission(current, 'logs.view')

    const conditions: SQL[] = []
    if (data.action && data.action !== 'all') {
      conditions.push(sql`action = ${data.action}`)
    }
    if (data.search) {
      conditions.push(
        sql`(actor_name ILIKE ${`%${data.search}%`} OR actor_email ILIKE ${`%${data.search}%`} OR target_name ILIKE ${`%${data.search}%`})`,
      )
    }
    const whereSql = conditions.length > 0
      ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
      : sql``

    const countResult = await db.execute(
      sql`SELECT COUNT(*)::int AS total FROM "admin_log" ${whereSql}`,
    )
    const total = Number((countResult.rows[0] as { total: number }).total)

    const offset = (data.page - 1) * data.pageSize
    const result = await db.execute(sql`
      SELECT
        id, actor_user_id, actor_name, actor_email, actor_level,
        action, target_type, target_id, target_name, details, created_at
      FROM "admin_log"
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ${data.pageSize} OFFSET ${offset}
    `)

    return {
      rows: (result.rows as LogRow[]).map(formatLog),
      total,
    }
  })
