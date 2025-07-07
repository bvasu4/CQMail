import { boolean, date, pgTable, serial, varchar } from "drizzle-orm/pg-core";


export const domains = pgTable('domains', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    registeredAt: date('registered_at').defaultNow().notNull(),
    isConfigured: boolean('is_configured').default(false),
});