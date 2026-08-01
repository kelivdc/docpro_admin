import { config } from 'dotenv'
import { Pool } from 'pg'
import { PostgresDialect } from 'kysely'
import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

config({ path: ['.env.local', '.env'] })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const auth = betterAuth({
  database: {
    dialect: new PostgresDialect({ pool }),
    type: 'postgres',
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://admin.nexonace.com',
    'https://admin.nexonace.com',
  ],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  user: {
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  session: {
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
    },
  },
  account: {
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          try {
            const result = await pool.query(
              `SELECT status FROM "admin" WHERE user_id = $1`,
              [session.userId],
            )
            if (result.rows.length > 0 && result.rows[0].status === 'blocked') {
              return false
            }
          } catch {
            // If query fails, allow login
          }
        },
      },
    },
  },
  plugins: [tanstackStartCookies()],
})
