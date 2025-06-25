import { useEffect, useRef, useState } from 'react';
import { createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';

import { getThread, getThreadMessages } from 'db/queries';
import { threadMessagesTable, threadsTable } from 'db/schema/petunia';
import { ChatMessage } from 'components/chat/ChatMessage';
import ChatInput from 'components/chat/ChatInput';
import ModelMenu from 'components/ModelMenu';
import { DefaultModel } from 'lib/chat/models';
import { appendThread, branchThread, regenerateMessage, startChatStream } from 'lib/actions/chat-actions';
import { getAuthSession } from 'lib/actions/auth-actions';

const getCurrentThread = createServerFn({ method: 'GET' })
  .validator((threadId: number | undefined) => threadId)
  .handler(async ({ data }) => {
    const thread = await getThread(data as number);
    let messages;
    if (thread) {
      messages = await getThreadMessages(thread.id);
    }
    return { thread, messages };
  })

export const Route = createFileRoute('/chat/$threadId')({
  component: RouteComponent,
  loader: async ({ params: { threadId } }) => {
    const authSession = await getAuthSession();
    if (!authSession) {
      return { curThread: null, statusCode: 404 }
    }

    let curThread: {
      thread: typeof threadsTable.$inferSelect | null;
      messages: Array<typeof threadMessagesTable.$inferSelect> | null;
      lastModel?: string | null;
    } = await getCurrentThread({ data: parseInt(threadId) });

    if (!curThread || !curThread.thread) {
      throw notFound();
    }

    if (curThread.messages) {
      curThread.lastModel = curThread.messages![curThread.messages!.length - 1]?.model;
    }

    return { curThread };
  }
})

function RouteComponent() {
  const { planInfo } = Route.useRouteContext();
  const { curThread, statusCode } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const { threadId } = Route.useParams();
  
  const [curModel, setCurModel] = useState(curThread?.lastModel ?? DefaultModel);
  const [messageInput, setMessageInput] = useState('');
  const [running, setRunning] = useState(false);
  const [responseText, setResponseText] = useState('')

  const chatViewRef = useRef<HTMLDivElement>(null);

  // const lastMessageIsUser = curThread.messages ? curThread.messages[curThread.messages.length - 1].role === 'user' : false;

  const handleStreamedMessage = (streamResponse: Response) => {
    setRunning(true);
    const reader = streamResponse.body?.getReader();
    
    const decoder = new TextDecoder();
    setResponseText('');
    reader?.read().then(function consume({ done, value }) {
      if (done) {
        setRunning(false);
        router.invalidate();
        if (chatViewRef.current) {
          chatViewRef.current.scrollTop = chatViewRef.current?.scrollHeight;
        }
        return;
      }
      setResponseText(prev => `${prev}${decoder.decode(value)}`);
      if (curThread && chatViewRef.current) {
        chatViewRef.current.scrollTop = chatViewRef.current?.scrollHeight;
      }
      return reader.read().then(consume);
    })
  }

  useEffect(() => {
    setCurModel(curThread?.lastModel ?? DefaultModel);
  }, [threadId]);

  // This is very dangerous but it's the one way that lets me generate messages without api routes.
  useEffect(() => {
    const startThread = async (curThread) => {
      // See the useEffect below for why.
      const firstMessageArray = curThread.messages!.filter(m => m.role === 'assistant' && m.state === 'generating')
      if (firstMessageArray.length === 1) {
        // unanswered message, kick off the stream
        const [firstMessage] = firstMessageArray;
        const response = await startChatStream({ data: { threadId: curThread.thread!.id, modelName: firstMessage.model! } });
        return response;
      }
    }
    if (curThread) {
      startThread(curThread).then(res => {
        res && handleStreamedMessage(res);
      })
    } else if (chatViewRef.current) {
      chatViewRef.current.scrollTop = chatViewRef.current?.scrollHeight;
    }
  }, [curThread]);

  const branch = async (threadMessageId: number) => {
    const { thread } = await branchThread({ data: { threadMessageId } });
    navigate({ to: '/chat/$threadId', params: { threadId: thread.id.toString() } });
  }

  const regenMessage = async (threadMessageId: number) => {
    await regenerateMessage({ data: { threadMessageId } });
    await router.invalidate();
  }

  const executeSubmission = async (form: HTMLFormElement) => {
    if (!messageInput) {
      return;
    }
    if (planInfo?.remaining && planInfo.remaining?.remaining <= 0) {
      return;
    }
    setResponseText('');
    const formData = new FormData(form);
    const message = formData.get('msg')?.toString().trim()!;
    setRunning(true);

    let thread = curThread?.thread;
    if (thread) {
      await appendThread({ data: { threadId: thread.id, msg: message, model: curModel! }});
      await router.invalidate();
    }
    
    setMessageInput('');
  }

  if (!curThread) {
    if (statusCode === 404) {
      return (
        <div className="flex grow justify-center items-center text-center">Thread not found.</div>
      )
    }
    return (
      <div>Unknown error.</div>
    )
  }

  return (
    <div className="flex flex-col grow relative">
      <div className="w-full flex grow p-2 border border-fuchsia-200 overflow-auto scroll-smooth dark:border-fuchsia-700" ref={chatViewRef}>
        {curThread.messages && (
          <div className="flex flex-col grow overflow-auto">
            <ol className="flex flex-col grow justify-end px-2 py-6 space-y-2">
              {curThread.messages.map(msg => (
                <ChatMessage 
                  key={msg.id}
                  branchSourceId={msg.lastBranchedMessage ? curThread.thread.branchedFromThreadId : null}
                  onBranch={async () => await branch(msg.id)}
                  onRegenerate={async () => await regenMessage(msg.id)}
                  message={
                    msg.role === 'assistant' && msg.state === 'generating'
                    ? { ...msg, content: responseText }
                    : msg
                  } />
              ))}
            </ol>
            <p className="m-4 text-center text-sm text-stone-500">AI isn't perfect (unlike you) so check for mistakes.</p>
          </div>
        )}
      </div>
      <form className="flex flex-col" onSubmit={async (event) => {
        event.preventDefault();
        await executeSubmission(event.currentTarget);
      }}>
        <div className="flex">
          <ChatInput
            isLoggedIn={!!planInfo}
            isOutOfMessages={planInfo?.remaining?.remaining <= 0}
            isRunning={running}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSubmit={executeSubmission}
          />
          <button 
            type="submit"
            className="px-4 py-1 border border-fuchsia-600 bg-fuchsia-200 font-bold duration-150 hover:bg-gradient-to-tl from-fuchsia-200 to-fuchsia-300 disabled:opacity-50 dark:text-slate-300 dark:bg-fuchsia-800 dark:from-fuchsia-800 dark:to-fuchsia-700"
            disabled={running}
          >
            Chat
          </button>
        </div>
        <div className="py-2">
          <ModelMenu plan={planInfo?.plan} modelCode={curModel!} onSetModel={setCurModel} />
        </div>
      </form>
    </div>
  )
}
