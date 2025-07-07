import { pgTable, serial, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { emailAccounts } from "./emailAccount.schema";
import { emails } from "./emails.schema";

export const drafts = pgTable("drafts", {
  id: serial("id").primaryKey(),
  
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  emailAccountId: integer("email_account_id").references(() => emailAccounts.id, { onDelete: "cascade" }),

  messageId: varchar("message_id", { length: 255 }),
  threadId: integer("thread_id").references(() => emails.thread_id, { onDelete: "cascade" }),
  parentMessageId: varchar("parent_message_id", { length: 255 }),

  to: text("to"),       // Comma-separated
  cc: text("cc"),
  bcc: text("bcc"),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),           // plain text body
  htmlContent: text("html_content"),  // HTML body

  attachments: text("attachments"),   // JSON stringified attachment metadata

  lastSaved: timestamp("last_saved").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
