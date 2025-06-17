import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

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

export const threadsTable = pgTable('threads', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text(),
  userId: integer().notNull().references(() => usersTable.id),
  ...auditTimestamps,
});

export const threadMessagesTable = pgTable('thread_messages', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  threadId: integer().notNull().references(() => threadsTable.id),
  role: text(),
  content: text().notNull(),
  state: text(),
  model: text(),
  finishReason: text(),
  completedAt: timestamp(),
  ...auditTimestamps,
});

export const threadMessageRelations = relations(threadsTable, ({ many }) => ({
  threadMessages: many(threadMessagesTable)
}));
