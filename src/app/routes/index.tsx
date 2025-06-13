import { useState } from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm';

import { chatStream } from 'lib/ollama-chat'
import { Route as LoginRoute } from './login';
import { Route as LogoutRoute } from './logout';
import { useAuthSession } from 'lib/session';
import { getLastUserMessage, getThread, getThreadMessages, getUser, getUserThreads } from 'db/queries';
import { db } from 'db';
import { threadMessagesTable, threadsTable } from 'db/schema';
import { generateThreadName } from 'lib/actions';
import { ChatMessage } from 'components/chat/ChatMessage';

type IndexParams = {
  threadId?: number;
};

const retrieveUserThreads = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);
    if (!session.data.email) {
      return [];
    }

    const user = await getUser(session.data.email);
    const threads = await getUserThreads(user!.id);

    return threads;
  })

const getCurrentThread = createServerFn({ method: 'GET' })
  .validator((threadId: number | undefined) => threadId)
  .handler(async ({ data }) => {
    const thread = await getThread(data!);
    let messages;
    if (thread) {
      messages = await getThreadMessages(thread.id);
    }
    return { thread, messages };
  })

const createThread = createServerFn({ method: 'POST' })
  .validator((msg: string | undefined) => msg)
  .handler(async ({ data }) => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);
    if (!session.data.email) {
      return;
    }

    const user = await getUser(session.data.email);
    const [thread] = await db.insert(threadsTable).values({ userId: user!.id }).returning();
    await db.insert(threadMessagesTable).values({
      threadId: thread.id,
      role: 'user',
      content: data!,
      completedAt: new Date(),
      state: 'done',
    });
    await generateThreadName(thread, data!);

    return thread;
  });

const appendThread = createServerFn({ method: 'POST' })
  .validator((data: { threadId: number | undefined; msg: string | undefined }) => data)
  .handler(async ({ data }) => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);
    if (!session.data.email) {
      return;
    }

    await db.insert(threadMessagesTable).values({
      threadId: data.threadId!,
      role: 'user',
      content: data.msg!,
      completedAt: new Date(),
      state: 'done',
    });
  });

const startChatStream = createServerFn({ method: 'POST', response: 'raw' })
  .validator((threadId: number | undefined) => threadId)
  .handler(async ({ data, signal }) => {
    const session = await useAuthSession(process.env.SESSION_SECRET!);
    if (!session.data.email) {
      return new Response('', {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
        status: 401,
      });
    }

    const dbMessages = await getThreadMessages(data!);
    const messages = dbMessages.map(msg => ({ role: msg.role!, content: msg.content! }))
    
    // Create a ReadableStream to send chunks of data
    const stream = new ReadableStream({
      async start(controller) {
        const [chatMessage] = await db.insert(threadMessagesTable).values({
          threadId: data!,
          state: 'generating',
          role: 'assistant',
          content: '',
        }).returning()
        const chatResponse = await chatStream(messages);

        for await (const part of chatResponse) {
          if (part.done) {
            await db.update(threadMessagesTable)
              .set({ state: 'done', completedAt: new Date() })
              .where(eq(threadMessagesTable.id, chatMessage.id));

            controller.close();
            return;
          }
          controller.enqueue(new TextEncoder().encode(part.message.content));
          await db.update(threadMessagesTable)
            .set({
              content: sql`${threadMessagesTable.content} || ${part.message.content}`
            })
            .where(eq(threadMessagesTable.id, chatMessage.id));
        }

        // Ensure we clean up if the request is aborted
        signal.addEventListener('abort', () => {
          db.update(threadMessagesTable)
            .set({ state: 'halted', completedAt: new Date() })
            .where(eq(threadMessagesTable.id, chatMessage.id));
          controller.close()
        })
      },
    })
  // Return a streaming response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

export const Route = createFileRoute('/')({
  component: Home,
  loaderDeps: ({ search: { threadId } }) => ({ threadId }),
  loader: async ({ deps: { threadId } }) => {
    const userThreads = await retrieveUserThreads();

    let curThread: {
      thread: typeof threadsTable.$inferSelect | null;
      messages: Array<typeof threadMessagesTable.$inferSelect> | null;
    } | null = null;
    if (threadId) {
      curThread = await getCurrentThread({ data: threadId });
    }

    return { curThread, userThreads };
  },
  validateSearch: (search: Record<string, unknown>): IndexParams => {
    return {
      threadId: search?.threadId as number
    }
  }
})

function Home() {
  const router = useRouter();

  const { user } = Route.useRouteContext();
  const { curThread, userThreads } = Route.useLoaderData();
  const { threadId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [messageInput, setMessageInput] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [responseText, setResponseText] = useState('');

  if (threadId && !curThread?.thread) {
    navigate({ search: { threadId: undefined } });
  }
  
  return (
    <div className="h-screen w-screen flex fixed">
      <nav className="w-60 h-full flex flex-col p-4">
        <h1 className="mb-4 text-center">Petunia chat</h1>
        <ul>
          {user && userThreads.length === 0 && (
            <li role="presentation">Time to chat.</li>
          )}
          <li>
            <Link to="/">New Chat</Link>
          </li>
          {user && userThreads.length > 0 && userThreads.slice(0, showMore ? 50 : 5).map((thread) => (
            <li key={thread.id}>
              <Link to={Route.to} search={{ threadId: thread.id }}>
                {curThread?.thread?.id === thread.id && '→'}
                {thread.name}
              </Link>
            </li>
          ))}
        </ul>
        {user && userThreads.length > 5 && (
          <button type="button" onClick={() => setShowMore(!showMore)}>
            Show {showMore ? 'Less' : 'More'}
          </button>
        )}
        <span className="mt-auto"></span>
        {user && (
          <div>
            <p>{user.email}</p>
            <Link to={LogoutRoute.to}>Log out</Link>
          </div>
        )}
        {!user && (
          <Link to={LoginRoute.to} className="text-left">Log in</Link>
        )}
      </nav>
      <div className="h-full w-full flex flex-col">
        <div className="w-full grow overflow-auto border border-slate-200">
          {!curThread && (
            <p className="m-4 p-4 bg-amber-50 border border-amber-300">
              You're about to witness the world's greatest chat app,
              <br />gonna zap the rest no cap cause it'll slap it won't be crap I gotta nap so end of rap.
              Jeb: "please clap"
            </p>
          )}
          {curThread && curThread.messages && (
            <ol>
              {curThread.messages.map(msg => (
                <li key={msg.id}>
                  <ChatMessage message={
                    msg.role === 'assistant' && msg.state === 'generating'
                    ? { ...msg, content: responseText }
                    : msg
                  } />
                </li>
              ))}
            </ol>
          )}
        </div>
        <form className="flex" onSubmit={async (event) => {
          event.preventDefault();
          setResponseText('');
          const formData = new FormData(event.currentTarget);
          const message = formData.get('msg')?.toString();

          let thread = curThread?.thread;
          if (thread) {
            await appendThread({ data: { threadId: thread.id, msg: message }});
            router.invalidate();
          } else {
            thread = await createThread({ data: message });
            navigate({ search: { threadId: thread!.id }});
          }
          setMessageInput('');

          const response = await startChatStream({ data: thread!.id });
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          setResponseText('');
          reader?.read().then(function consume({ done, value }) {
            if (done) {
              router.invalidate();
              return;
            }
            setResponseText(prev => `${prev}${decoder.decode(value)}`)
            return reader.read().then(consume);
          })
        }}>
          <textarea 
            name="msg"
            className="w-full p-2 border resize-none"
            placeholder={user ? "Chat away" : "For now I gotta have you log in to use this thing."}
            readOnly={!user}
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
          />
          <button type="submit" className="px-4 py-1" disabled={!user}>Chat</button>
        </form>
      </div>
    </div>
  )
}