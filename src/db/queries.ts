import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "db";
import { threadMessagesTable, threadsTable, usersTable } from "./schema";

export const getUser = async (email: string): Promise<typeof usersTable.$inferSelect | null> => {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

export const getUserThreads = async (userId: number): Promise<Array<typeof threadsTable.$inferSelect>> =>
  db.select()
    .from(threadsTable)
    .where(eq(threadsTable.userId, userId))
    .orderBy(desc(threadsTable.createdAt))


export const getThread = async (threadId: number): Promise<typeof threadsTable.$inferSelect | null> => {
  const result = await db
    .select()
    .from(threadsTable)
    .where(eq(threadsTable.id, threadId));

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

export const getThreadMessage = async (threadId: number): Promise<typeof threadMessagesTable.$inferSelect | null> => {
  const result = await db
    .select()
    .from(threadMessagesTable)
    .where(eq(threadMessagesTable.id, threadId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

export const getThreadMessages = async (threadId: number): Promise<Array<typeof threadMessagesTable.$inferSelect>> =>
  db.select()
    .from(threadMessagesTable)
    .where(and(eq(threadMessagesTable.threadId, threadId), isNull(threadMessagesTable.regeneratedMessageId)))
    .orderBy(threadMessagesTable.createdAt);

export const getLastUserMessage = async (threadId: number): Promise<typeof threadMessagesTable.$inferSelect | null> => {
  const result = await db
    .select()
    .from(threadMessagesTable)
    .where(and(
      eq(threadMessagesTable.threadId, threadId), 
      eq(threadMessagesTable.role, 'user')
    ))
    .orderBy(desc(threadMessagesTable.createdAt))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}
