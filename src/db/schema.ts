import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

const auditTimestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
}

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean(),
  ...auditTimestamps,
})
