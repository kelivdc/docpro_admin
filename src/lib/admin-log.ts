import { sql } from 'drizzle-orm'
import { db } from '#/db'
import { getCurrentAdmin } from '#/lib/admin-auth'

export type LogDetails = Record<string, unknown>

async function resolveTargetName(targetType: string, targetId: string): Promise<string | null> {
  try {
    if (targetType === 'admin') {
      const r = await db.execute(
        sql`SELECT u.name FROM "admin" a JOIN "user" u ON u.id = a.user_id WHERE a.id = ${targetId} OR a.user_id = ${targetId} LIMIT 1`,
      )
      return r.rows.length ? (r.rows[0] as { name: string }).name : null
    }
    if (targetType === 'user') {
      const r = await db.execute(sql`SELECT name FROM "user" WHERE id = ${targetId}`)
      return r.rows.length ? (r.rows[0] as { name: string }).name : null
    }
  } catch {
    return null
  }
  return null
}

export async function logAdminAction(opts: {
  action: string
  targetType: 'admin' | 'user' | 'system'
  targetId: string
  targetName?: string
  details?: LogDetails
}): Promise<void> {
  try {
    const actor = await getCurrentAdmin()
    const targetName = opts.targetName ?? (await resolveTargetName(opts.targetType, opts.targetId)) ?? opts.targetId

    await db.execute(sql`
      INSERT INTO "admin_log"
        (actor_user_id, actor_name, actor_email, actor_level, action, target_type, target_id, target_name, details)
      VALUES
        (${actor?.userId ?? 'system'}, ${actor?.name ?? 'System'}, ${actor?.email ?? '-'}, ${actor?.level ?? 'system'}, ${opts.action}, ${opts.targetType}, ${opts.targetId}, ${targetName}, ${opts.details ? JSON.stringify(opts.details) : null})
    `)
  } catch {
    // logging must never break the underlying action
  }
}
