import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { auth } from "lib/auth/auth";
import { getEvent } from "vinxi/http";

export const getAuthSession = createServerFn({ method: "GET" }).handler(
  async () => {
    return auth.api.getSession({ headers: getHeaders() as unknown as any, });
  }
);