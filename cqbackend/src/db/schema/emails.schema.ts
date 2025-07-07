// src/db/schema/emails.schema.ts
import { pgTable, serial,jsonb, varchar, integer, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const priorityEnum = pgEnum('priority', ['High', 'Normal', 'Low']);

export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  message_id: varchar('message_id', { length: 255 }).unique(),
  user_id: integer('user_id'),
  email_account_id: integer('email_account_id'),
thread_id: varchar('thread_id', { length: 255 }),
in_reply_to_id: varchar('in_reply_to_id'),
 references_ids: jsonb('references_ids'),
  parent_message_id: varchar('parent_message_id', { length: 255 }),
  from_email: varchar('from_email', { length: 255 }),
  to: text('to'),
  cc: text('cc'),
  bcc: text('bcc'),
  subject: varchar('subject', { length: 255}),
  content: text('content'),
  html_content: text('html_content'),
  attachments: text('attachments'),
  email_type: varchar('email_type', { length: 20 }),
  status: varchar('status', { length: 50 }),//enum
  folder: varchar('folder', { length: 50 }),//enum
  is_read: boolean('is_read').default(false),
  is_starred: boolean('is_starred').default(false),
  is_important: boolean('is_important').default(false),
  is_deleted: boolean('is_deleted').default(false),
  is_spam: boolean('is_spam').default(false),
  metadata: text('metadata'),
  sent_at: timestamp('sent_at'),
  delivered_at: timestamp('delivered_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  priority: priorityEnum('priority'),
  forwarded: boolean('forwarded').default(false),
});
