import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import ChatInput from 'components/chat/ChatInput'
import Welcome from 'components/chat/Welcome'
import { createThread } from 'lib/actions/chat-actions'
import ModelMenu from 'components/ModelMenu'
import { DefaultModel } from 'lib/chat/models'
import ChatAttachment from 'components/chat/ChatAttachment'
import { generatePresignedUrl } from 'lib/actions/upload-actions'

export const Route = createFileRoute('/chat/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { planInfo } = Route.useRouteContext();

  const [curModel, setCurModel] = useState(DefaultModel);
  const [messageInput, setMessageInput] = useState('');
  const [file, setFile] = useState<File>();
  const [running, setRunning] = useState(false);

  const fileObjectUrl = useMemo(() => file && URL.createObjectURL(file), [file]);
  
  const inputDisabled = running || planInfo?.remaining?.remaining <= 0;

  const executeSubmission = async (form: HTMLFormElement) => {
    if (!messageInput) {
      return;
    }
    if (planInfo?.remaining?.remaining <= 0) {
      return;
    }
    const formData = new FormData(form);
    const message = formData.get('msg')?.toString();
    const attachment = formData.get('attachment') as File;

    const { thread, firstUserMessage } = await createThread({ data: {
      msg: message!, model: curModel, attachmentMime: attachment.size > 0 ? attachment.type : undefined,
    } })!;

    setRunning(true);

    if (attachment.size > 0) {
      const { url } = await generatePresignedUrl({ data: { threadMessageId: firstUserMessage.id, method: 'put' } });
      
      const uploadResponse = await fetch(url, { method: 'PUT', body: attachment });
    }

    navigate({ to: `/chat/$threadId`, params: { threadId: thread!.id.toString() } });
  }

  return (
    <div className="flex flex-col justify-between flex-auto">
      <Welcome onMessage={setMessageInput} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await executeSubmission(e.currentTarget);
        }}
      >
        <div className="flex">
          <ChatInput
            isLoggedIn={true}
            isRunning={running}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSubmit={executeSubmission}
            isOutOfMessages={planInfo?.remaining?.remaining <= 0}
          />
          {file && (
            <div className="flex justify-center items-center p-2 border">
              <img src={fileObjectUrl} className="max-h-16 object-contain" />
            </div>
          )}
          <button 
            type="submit"
            className="px-4 py-1 border border-fuchsia-600 bg-fuchsia-200 font-bold duration-150 hover:bg-gradient-to-tl from-fuchsia-200 to-fuchsia-300 disabled:opacity-50 dark:text-slate-300 dark:bg-fuchsia-800 dark:from-fuchsia-800 dark:to-fuchsia-700"
            disabled={inputDisabled}
          >
            Chat
          </button>
        </div>
        <div className="py-2 flex justify-between items-center">
          <ModelMenu plan={planInfo?.plan} modelCode={curModel} onSetModel={setCurModel} />
          <ChatAttachment disabled={inputDisabled} onChange={setFile} value={file} />
        </div>
      </form>
    </div>
  )
}
