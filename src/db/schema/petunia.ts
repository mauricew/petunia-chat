import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const auditTimestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
}

export const threadsTable = pgTable('threads', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text(),
  userId: text().notNull().references(() => users.id),
  branchedFromThreadId: integer().references(() => threadsTable.id),
  ...auditTimestamps,
});

export const threadMessagesTable = pgTable('thread_messages', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  threadId: integer().notNull().references(() => threadsTable.id),
  role: text(),
  content: text().notNull(),
  attachmentFilename: text(),
  attachmentMime: text(),
  state: text(),
  model: text(),
  finishReason: text(),
  completedAt: timestamp(),
  regeneratedMessageId: integer().references(() => threadMessagesTable.id),
  lastBranchedMessage: boolean(), // not great eh
  ...auditTimestamps,
});

export const threadMessageRelations = relations(threadsTable, ({ many }) => ({
  threadMessages: many(threadMessagesTable)
}));
