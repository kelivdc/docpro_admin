import { config } from 'dotenv'
import { Pool } from 'pg'
import { hashPassword } from '@better-auth/utils/password'

config({ path: ['.env.local', '.env'] })

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  const email = 'admin@docpro.id'
  const password = 'AdminDocPro2026!'
  const name = 'DocPro Admin'

  // Delete existing user+account if any
  await pool.query(`DELETE FROM "session" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`, [email])
  await pool.query(`DELETE FROM "account" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`, [email])
  await pool.query(`DELETE FROM "user" WHERE email = $1`, [email])

  const userId = crypto.randomUUID()
  const passwordHash = await hashPassword(password)

  // Insert user
  await pool.query(
    `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, name, email, false, new Date(), new Date()]
  )
  console.log('User inserted:', userId)

  // Insert account
  const accountId = crypto.randomUUID()
  await pool.query(
    `INSERT INTO "account" (id, user_id, account_id, provider_id, password, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [accountId, userId, email, 'credential', passwordHash, new Date(), new Date()]
  )
  console.log('Account inserted')

  console.log(`Created admin user: ${email}`)
  await pool.end()
}

main().catch(console.error)
