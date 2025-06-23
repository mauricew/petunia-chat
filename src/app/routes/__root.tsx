import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'

import lexendFontCss from '@fontsource/lexend?url';
import tailwindCss from '../globals.css?url'
import highlightJsCss from 'highlight.js/styles/github-dark-dimmed.css?url';
import { ThemeProvider } from 'components/ThemeProvider';
import { getAuthSession, getUserSubscriptionInfo } from 'lib/actions/auth-actions';
import { users } from 'db/schema/auth';

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
    links: [
      {
        rel: 'stylesheet',
        href: lexendFontCss
      },
      {
        rel: 'stylesheet',
        href: tailwindCss
      },
      {
        rel: 'stylesheet',
        href: highlightJsCss,
      }
    ]
  }),
  component: RootComponent,
  beforeLoad: async () => {
    const sessionData = await getAuthSession();
    const user = sessionData?.user;

    let planInfo;
    if (user) {
      planInfo = await getUserSubscriptionInfo();
    }

    return { 
      user: user as typeof users.$inferSelect | undefined,
      planInfo
    };
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
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main>
            {children}
          </main>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}