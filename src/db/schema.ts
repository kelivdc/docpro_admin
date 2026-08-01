import { pgTable, text, timestamp, boolean, jsonb, uuid } from 'drizzle-orm/pg-core'

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

export const adminLogs = pgTable('admin_log', {
  id: uuid().primaryKey().defaultRandom(),
  actorUserId: text('actor_user_id').notNull(),
  actorName: text('actor_name').notNull(),
  actorEmail: text('actor_email').notNull(),
  actorLevel: text('actor_level').notNull(),
  action: text().notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  targetName: text('target_name').notNull(),
  details: jsonb(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
