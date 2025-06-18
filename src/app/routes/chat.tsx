import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';

import Sidebar from 'components/Sidebar';
import { getUser, getUserThreads } from 'db/queries';
import { getAuthSession } from 'lib/actions/auth-actions';
import { useState } from 'react';

const retrieveUserThreads = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await getAuthSession();
    if (!session) {
      return [];
    }

    const user = await getUser(session.user.email);
    const threads = await getUserThreads(user!.id);

    return threads;
  })

export const Route = createFileRoute('/chat')({
  component: RouteComponent,
  loader: async () => {
    const userThreads = await retrieveUserThreads();
    return { userThreads };
  }
})

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const { userThreads } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-row">
      <Sidebar
        curThread={null}
        isCollapsed={isCollapsed}
        onLogoutGlobal={() => {
          navigate({ to: '/' });
        }}
        user={user}
        userThreads={userThreads}
      />
      <div className="relative flex grow border border-fuchsia-200 dark:border-fuchsia-700">
        <button 
          type="button" 
          className="absolute left-1 top-1 px-4 py-2 text-sm z-10 bg-neutral-100 duration-150 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        </button>
        <Outlet />
      </div>
    </div>
  );
}
