import { eq } from "drizzle-orm";

import { db } from "db";
import { threadsTable } from "db/schema";
import { generateThreadTitle } from "./chat";

export const generateThreadName = async (thread: typeof threadsTable.$inferSelect, message: string) => {
  const name = await generateThreadTitle(message);
  await db.update(threadsTable).set({ name }).where(eq(threadsTable.id, thread.id));
}
