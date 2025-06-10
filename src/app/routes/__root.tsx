import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';

import '../globals.css'
import { getUser } from 'db/queries';
import { useAuthSession } from 'lib/session';

const initLoadUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);

    if (!session.data.email) {
      return null;
    }

    const user = await getUser(session.data.email);
    return user;
  })

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Petunia Chat',
      },
    ],
  }),
  component: RootComponent,
  beforeLoad: async () => {
    const user = await initLoadUser();
    return { user };
  }
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}