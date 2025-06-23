import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { getUserPlan, getUserRemainingMessages } from "db/queries";
import { auth } from "lib/auth/auth";

export const getAuthSession = createServerFn({ method: "GET" }).handler(
  async () => {
    return auth.api.getSession({ headers: getHeaders() as unknown as any, });
  }
);

export const getUserSubscriptionInfo = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await auth.api.getSession({ headers: getHeaders() as unknown as any, });
    const plan = await getUserPlan(session!.user.id);
    const remaining = await getUserRemainingMessages(session!.user.id);
    return { plan, remaining }
  })