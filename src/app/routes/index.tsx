import { useMemo, useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { chatStream } from 'lib/ollama-chat'
import { marked } from 'marked';

const submitChatStream = createServerFn({ method: 'POST', response: 'raw' })
  .validator((msg: string | undefined) => msg)
  .handler(async ({ data, signal }) => {
    // Create a ReadableStream to send chunks of data
    const stream = new ReadableStream({
      async start(controller) {
        const chatResponse = await chatStream(data!);

        for await (const part of chatResponse) {
          if (part.done) {
            controller.close();
            return;
          }
          controller.enqueue(new TextEncoder().encode(part.message.content));
        }

        // Ensure we clean up if the request is aborted
        signal.addEventListener('abort', () => {
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
})

function Home() {
  const [responseText, setResponseText] = useState('');
  const responseMarked = useMemo(() => marked(responseText), [responseText]);

  return (
    <div className="h-screen w-screen flex fixed">
      <nav className="w-60 h-full flex flex-col p-4">
        <h1 className="mb-4 text-center">Petunia chat</h1>
        <ul>
          <li>History item 1</li>
          <li>History item 2</li>
          <li>History item 3</li>
        </ul>
        <span className="mt-auto"></span>
        <button className="text-left">Log in</button>
      </nav>
      <div className="h-full w-full flex flex-col">
        <div className="w-full grow overflow-auto border border-slate-200">
          {!responseText && (
            <p className="m-4 p-4 bg-amber-50 border border-amber-300">
              You're about to witness the world's greatest chat app,
              <br />gonna zap the rest no cap cause it'll slap it won't be crap I gotta nap so end of rap.
              Jeb: "please clap"
            </p>
          )}
          {responseText && (
            <div 
              className="w-full p-4 overflow-auto"
              dangerouslySetInnerHTML={{ __html: responseMarked }}>
            </div>
          )}
        </div>
        <form className="flex" onSubmit={async (event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const response = await submitChatStream({ data: formData.get('msg')?.toString() });
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          setResponseText('');
          reader?.read().then(function consume({ done, value }) {
            if (done) {
              return;
            }
            setResponseText(prev => `${prev}${decoder.decode(value)}`)
            return reader.read().then(consume);
          })
        }}>
          <textarea 
            name="msg"
            className="w-full p-2 border resize-none"
            placeholder="Chat away"
          />
          <button type="submit" className="px-4 py-1">Chat</button>
        </form>
      </div>
    </div>
  )
}