import { useLayoutEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ComputerIcon, GitBranchIcon, MoonIcon, PencilLineIcon, SunIcon } from 'lucide-react';

import { threadMessagesTable, threadsTable, usersTable } from "db/schema";
import { Route as ChatThreadRoute } from '../app/routes/chat/$threadId';
import { Route as LoginRoute } from '../app/routes/login';
import { Route as LogoutRoute } from '../app/routes/logout';
import { useTheme } from "./ThemeProvider";

export default function Sidebar(props: {
  curThread: {
    thread: typeof threadsTable.$inferSelect | null;
    messages: Array<typeof threadMessagesTable.$inferSelect> | null;
  } | null,
  isCollapsed: boolean;
  user: (typeof usersTable.$inferSelect) | null,
  userThreads: Array< typeof threadsTable.$inferSelect> 
}) {
  const { curThread, isCollapsed, user, userThreads } = props;
  const [showMore, setShowMore] = useState(false);

  const { theme, setTheme } = useTheme();

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
        {user && (
          <div>
            <p className="font-semibold">{user.email}</p>
            <Link to={LogoutRoute.to} className="py-2 text-sm">Log out</Link>
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
        )}
        {!user && (
          <Link to={LoginRoute.to} className="py-2 text-left font-lexend">Log in</Link>
        )}
      </div>
    </nav>
  )
}