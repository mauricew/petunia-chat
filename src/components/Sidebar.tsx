import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { threadMessagesTable, threadsTable, usersTable } from "db/schema";
import { Route as ChatThreadRoute } from '../app/routes/chat/$threadId';
import { Route as LoginRoute } from '../app/routes/login';
import { Route as LogoutRoute } from '../app/routes/logout';

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

  // Until I get next-themes up and running
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const changeTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.body.classList.toggle('dark');
  }
  useLayoutEffect(() => {
    setTheme(document.body.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  return (
    <nav className={`w-64 h-full flex flex-col duration-150 ${isCollapsed ? '-ml-64' : ''}`}>
      <h1 className="mb-4 px-4 py-3 text-center text-lg font-semibold bg-fuchsia-100 text-fuchsia-900 border-b border-fuchsia-400 dark:bg-fuchsia-900 dark:text-fuchsia-200">
        Petunia chat
      </h1>
      <div className="flex flex-col flex-1 px-4 py-2">
        <Link
          to="/chat"
          className="flex justify-center p-2 rounded-xl text-lg font-medium bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 text-center duration-150 hover:bg-fuchsia-200 dark:bg-fuchsia-900 dark:text-fuchsia-300 dark:border-fuchsia-500 dark:hover:bg-fuchsia-800 dark:hover:text-fuchsia-200"
          activeProps={{ className: "bg-fuchsia-800 !text-fuchsia-200 hover:bg-fuchsia-700" }}
          activeOptions={{ includeSearch: true, exact: true }}
        >
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
                className="block p-2 bg-fuchsia-50 border border-fuchsia-300 text-fuchsia-700 rounded whitespace-nowrap overflow-hidden text-ellipsis duration-150 hover:whitespace-normal hover:text-fuchsia-900 dark:bg-fuchsia-800 dark:text-fuchsia-300 dark:border-fuchsia-600 dark:hover:text-fuchsia-200"
                activeProps={{ className: 'bg-fuchsia-200 text-fuchsia-800 font-semibold dark:bg-fuchsia-700 dark:text-fuchsia-200' }}
              >
                {curThread?.thread?.id === thread.id && '→ '}
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
            <button onClick={() => changeTheme()}>
              {theme === 'dark' ? 'Dark Mode (switch to light)' : 'Light Mode (switch to dark)'}
            </button>
          </div>
        )}
        {!user && (
          <Link to={LoginRoute.to} className="py-2 text-left">Log in</Link>
        )}
      </div>
    </nav>
  )
}