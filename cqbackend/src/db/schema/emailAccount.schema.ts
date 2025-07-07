// src/db/schema/emailAccount.schema.ts
import { pgTable, serial, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const emailAccounts = pgTable('email_accounts', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  appPassword: varchar('app_password', { length: 255 }),
  isDefault: boolean('is_default').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
