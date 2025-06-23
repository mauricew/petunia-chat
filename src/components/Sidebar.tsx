import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ComputerIcon, GitBranchIcon, MoonIcon, PencilLineIcon, SunIcon } from 'lucide-react';

import { threadsTable } from "db/schema/petunia";
import { Route as ChatThreadRoute } from '../app/routes/chat/$threadId';
import { Route as LoginRoute } from '../app/routes/login';
import { useTheme } from "./ThemeProvider";
import { users } from "db/schema/auth";
import { authClient } from "lib/auth/auth-client";
import LimitationDialog from "./LimitationDialog";
import { subscriptionsTable } from "db/schema/subscriptions";
import { addDays, formatRelative } from "date-fns";

export default function Sidebar(props: {
  currentPlan: typeof subscriptionsTable.$inferSelect['plan'],
  isCollapsed: boolean;
  onLogoutGlobal: () => void;
  limitInfo: { remaining: number; earliest: Date } | undefined,
  user: (typeof users.$inferSelect) | undefined,
  userThreads: Array< typeof threadsTable.$inferSelect> 
}) {
  const { currentPlan, isCollapsed, onLogoutGlobal, limitInfo, user, userThreads } = props;
  const [showMore, setShowMore] = useState(false);

  const { theme, setTheme } = useTheme();

  const { signOut } = authClient

  const logout = async () => {
    await signOut();
    onLogoutGlobal();
  }

  return (
    <nav className={`w-64 h-full flex flex-col duration-150 ${isCollapsed ? '-ml-64' : ''}`}>
      <h1 className="mb-4 px-4 py-3 text-center text-xl font-lexend font-bold bg-fuchsia-100 text-fuchsia-900 border-b border-fuchsia-400 dark:bg-fuchsia-900 dark:text-fuchsia-200">
        Petunia chat
      </h1>
      <div className="flex flex-col flex-1 px-4 py-2">
        <Link
          to="/chat"
          className={`flex justify-center gap-1 p-2 rounded-xl text-lg font-lexend font-medium 
            bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 text-center duration-150 hover:bg-fuchsia-200
            dark:bg-fuchsia-900 dark:text-fuchsia-300 dark:border-fuchsia-500 dark:hover:bg-fuchsia-800 dark:hover:text-fuchsia-200
          `}
          activeProps={{ className: "bg-fuchsia-800 dark:!bg-fuchsia-300 !text-fuchsia-200 dark:!text-fuchsia-800 hover:bg-fuchsia-700" }}
          activeOptions={{ includeSearch: true, exact: true }}
        >
          <PencilLineIcon />
          New Chat
        </Link>
        <ul className="h-64 my-4 space-y-2 grow text-sm overflow-auto">
          {user && userThreads.length === 0 && (
            <li role="presentation">Time to chat.</li>
          )}
          {user && userThreads.length > 0 && userThreads.slice(0, showMore ? 50 : 5).map((thread) => (
            <li key={thread.id}>
              <Link
                to={ChatThreadRoute.to}
                params={{ threadId: thread.id.toString() }}
                className="flex items-center gap-1 p-2 bg-fuchsia-50 border border-fuchsia-300 text-fuchsia-700 rounded whitespace-nowrap overflow-hidden text-ellipsis duration-150 hover:whitespace-normal hover:text-fuchsia-900 dark:bg-fuchsia-800 dark:text-fuchsia-300 dark:border-fuchsia-600 dark:hover:text-fuchsia-200"
                activeProps={{ className: 'bg-fuchsia-200 text-fuchsia-800 font-semibold dark:!bg-fuchsia-300 dark:!text-fuchsia-800' }}
              >
                {thread.branchedFromThreadId && <GitBranchIcon size={16} />}
                {thread.name}
              </Link>
            </li>
          ))}
          {user && userThreads.length > 5 && (
            <li role="presentation">
              <button type="button" onClick={() => setShowMore(!showMore)}>
                Show {showMore ? 'Less' : 'More'}
              </button>
            </li>
          )}
        </ul>
        
        <span className="mt-auto"></span>
        <div>
          {user && (
            <>
              <p className="font-semibold">{user.email}</p>
              <div className="flex justify-between">
                <small>
                  <strong>{currentPlan}</strong> plan &bull;{' '}
                  {limitInfo!.remaining === 0 && (
                    <>Refills {formatRelative(addDays(limitInfo!.earliest, 1), new Date())} </>
                  )}
                  {limitInfo!.remaining > 0 && (
                    <>{limitInfo!.remaining} messages left</>
                  )}
                </small>
                <LimitationDialog limitInfo={limitInfo!} />
              </div>
              <button className="py-2 text-sm" onClick={async () => await logout()}>Log out</button>
            </>
          )}
          <div className="flex justify-around">
            <button 
              className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-800 ${theme === 'light' ? 'text-fuchsia-500 dark:text-fuchsia-300' : ''}`}
              onClick={() => setTheme('light')}
            >
              <SunIcon size={16} />
            </button>
            <button 
              className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-800 ${theme === 'system' ? 'text-fuchsia-500 dark:text-fuchsia-300' : ''}`}
              onClick={() => setTheme('system')}
            >
              <ComputerIcon size={16} />
            </button>
            <button 
              className={`p-2 hover:bg-gray-200 dark:hover:bg-gray-800 ${theme === 'dark' ? 'text-fuchsia-500 dark:text-fuchsia-300' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <MoonIcon size={16} />
            </button>
          </div>
          </div>
        {!user && (
          <Link to={LoginRoute.to} className="py-2 text-left font-lexend">Log in</Link>
        )}
      </div>
    </nav>
  )
}