// src/db/schema/user.schema.ts
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  firstname: varchar('firstname', { length: 100 }).notNull(),
  lastname: varchar('lastname', { length: 100 }).notNull(),
  phonenumber: varchar('phonenumber', { length: 20 }),
  employeeid: varchar('employeeid', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  alternate_email: varchar('alternate_email', { length: 255 }),
});

