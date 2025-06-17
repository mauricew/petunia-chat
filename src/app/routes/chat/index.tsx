import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import ChatInput from 'components/chat/ChatInput'
import Welcome from 'components/chat/Welcome'
import { createThread } from 'lib/actions/chat-actions'
import ModelMenu from 'components/ModelMenu'
import { DefaultModel } from 'lib/chat/models'

export const Route = createFileRoute('/chat/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate();

  const [curModel, setCurModel] = useState(DefaultModel);
  const [messageInput, setMessageInput] = useState('');
  const [running, setRunning] = useState(false);

  const executeSubmission = async (form: HTMLFormElement) => {
    if (!messageInput) {
      return;
    }
    const formData = new FormData(form);
    const message = formData.get('msg')?.toString();

    const thread = await createThread({ data: { msg: message, model: curModel } });

    navigate({ to: `/chat/$threadId`, params: { threadId: thread!.id.toString() } });
  }

  return (
    <div className="flex flex-col justify-between flex-auto">
      <Welcome />
      <form
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <div className="flex">
          <ChatInput
            isLoggedIn={true}
            isRunning={false}
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
          <ModelMenu modelCode={curModel} onSetModel={setCurModel} />
        </div>
      </form>
    </div>
  )
}
