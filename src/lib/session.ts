import { useSession } from "@tanstack/react-start/server";

export const useAuthSession = (secret: string) => useSession<{ email: string}>({
  password: secret,
})
