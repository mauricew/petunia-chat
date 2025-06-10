import { eq } from "drizzle-orm";

import { db } from "db";
import { usersTable } from "./schema";

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
