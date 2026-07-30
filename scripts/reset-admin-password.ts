import { hashPassword } from '@better-auth/utils/password'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: 'postgres://docpro:docpro_secret@vps-nexonace:5433/docpro',
})

async function main() {
  const email = 'admin@docpro.id'
  const password = 'AdminDocPro2026!'

  const user = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [email])
  if (user.rows.length === 0) {
    console.error('User not found')
    process.exit(1)
  }

  const userId = user.rows[0].id
  const passwordHash = await hashPassword(password)

  await pool.query(
    `UPDATE "account" SET password = $1, updated_at = NOW() WHERE user_id = $2 AND provider_id = 'credential'`,
    [passwordHash, userId],
  )

  console.log('Password updated for', email)
  await pool.end()
}

main()
