// src/db/schema/users.ts

import { pgEnum, pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('role', ['Admin', 'Employee']); 

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstname: varchar('firstname', { length: 255 }),
  lastname: varchar('lastname', { length: 255 }),
  displayName: varchar('display_name', { length: 255 }),
  employeeId: varchar('employee_id', { length: 255 }),
  role: userRoleEnum('role').default('Employee'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
