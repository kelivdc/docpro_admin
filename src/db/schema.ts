import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'

export const users = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text(),
  status: text().notNull().default('active'),
  role: text().notNull().default('viewer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const admins = pgTable('admin', {
  id: text().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  level: text().notNull().default('standard'),
  status: text().notNull().default('active'),
  permissions: jsonb().notNull().default(['queries.view']),
  lastActiveAt: timestamp('last_active_at'),
  createdById: text('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
