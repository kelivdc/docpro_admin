import { config } from 'dotenv'
import { Pool } from 'pg'
import { hashPassword } from '@better-auth/utils/password'

config({ path: ['.env.local', '.env'] })

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  const email = process.env.SUPERADMIN_EMAIL ?? 'admin@docpro.id'
  const password = process.env.SUPERADMIN_PASSWORD ?? 'AdminDocPro2026!'
  const name = process.env.SUPERADMIN_NAME ?? 'DocPro Admin'
  const adminId = process.env.SUPERADMIN_ID ?? 'adm_super_001'

  if (password.length < 8) {
    throw new Error('Password harus minimal 8 karakter')
  }

  await pool.query(`DELETE FROM "session" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`, [email])
  await pool.query(`DELETE FROM "admin" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`, [email])
  await pool.query(`DELETE FROM "account" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`, [email])
  await pool.query(`DELETE FROM "user" WHERE email = $1`, [email])

  const userId = crypto.randomUUID()
  const passwordHash = await hashPassword(password)

  await pool.query(
    `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, name, email, false, new Date(), new Date()],
  )
  console.log('User inserted:', userId)

  const accountId = crypto.randomUUID()
  await pool.query(
    `INSERT INTO "account" (id, user_id, account_id, provider_id, password, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [accountId, userId, email, 'credential', passwordHash, new Date(), new Date()],
  )
  console.log('Account inserted')

  await pool.query(
    `INSERT INTO "admin" (id, user_id, level, status, permissions, created_at, updated_at)
     VALUES ($1, $2, 'super', 'active', '["all"]', NOW(), NOW())`,
    [adminId, userId],
  )
  console.log('Admin (super) inserted:', adminId)

  console.log(`Superadmin siap: ${email} / ${password}`)
  await pool.end()
}

main().catch((e) => {
  console.error('ERROR:', e instanceof Error ? e.message : e)
  process.exit(1)
})
