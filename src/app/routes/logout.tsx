import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';
import { useAuthSession } from 'lib/session';

const logout = createServerFn()
  .handler(async () => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);

    await session.clear();
    
    throw redirect({ to: '/' });
  })

export const Route = createFileRoute('/logout')({
  loader: () => logout(),
  preload: false,
})

