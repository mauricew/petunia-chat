import { and, between, count, desc, eq, gte, isNull, min, or, sql } from "drizzle-orm";
import { subDays } from 'date-fns';

import { db } from "db";
import { threadMessagesTable, threadsTable } from "./schema/petunia";
import { users as usersTable } from "./schema/auth";
import { DAILY_MESSAGE_COUNT } from "lib/constants";
import { subscriptionsTable } from "./schema/subscriptions";

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


export const getUserPlan = async (userId: string): Promise<typeof subscriptionsTable.$inferSelect['plan']> => {
  const plan = await db
    .select({ plan: subscriptionsTable.plan })
    .from(subscriptionsTable)
    .where(and(
      eq(subscriptionsTable.userId, userId),
      or(isNull(subscriptionsTable.expiresAt), between(sql`NOW()`, subscriptionsTable.effectiveAt, subscriptionsTable.expiresAt))
    ))
    .limit(1);

  if (plan.length === 0) {
    return 'free';
  }

  return plan[0].plan;
}

export const getUserRemainingMessages = async(userId: string) => {
  const yesterday = subDays(new Date(), 1);

  const plan = await getUserPlan(userId);

  const [{ count: msgCount, earliest }] = await db
    .select({ count: count(), earliest: min(threadMessagesTable.createdAt) })
    .from(threadMessagesTable)
    .innerJoin(threadsTable, eq(threadsTable.id, threadMessagesTable.threadId))
    .where(and(
      eq(threadMessagesTable.role, 'user'),
      eq(threadsTable.userId, userId),
      gte(threadMessagesTable.createdAt, yesterday)
    ));

  return {
    earliest,
    remaining: DAILY_MESSAGE_COUNT[plan] - msgCount
  };
}

export const getUserThreads = async (userId: string): Promise<Array<typeof threadsTable.$inferSelect>> =>
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
