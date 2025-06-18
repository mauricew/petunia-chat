import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";

import RelativeTime from "components/RelativeTime";
import { threadMessagesTable } from "db/schema";
import MessageToolbar from "./MessageToolbar";
import { generatePresignedUrl } from "lib/actions/upload-actions";

type ChatMessageProps = {
  message: Partial<typeof threadMessagesTable.$inferSelect>;
  onRegenerate: () => Promise<void>;
}

export const ChatMessage = ({ message, onRegenerate }: ChatMessageProps) => {
  const messageMarked = useMemo(() => marked(message.content!), [message]);
  const [recentlyCopied, setRecentlyCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>()
  console.log(imageUrl)

  const messageTime = message.role === 'assistant' ? message.completedAt : message.createdAt;

  const timeTaken = message.completedAt 
    ? ((message.completedAt.getTime() - message.createdAt!.getTime()) / 1000).toFixed(2)
    : null;

  const onCopy = () => {
    window.navigator.clipboard.writeText(message.content!);
    setRecentlyCopied(true);
    setTimeout(() => setRecentlyCopied(false), 5000);
  }

  useEffect(() => {
    if (message.attachmentFilename) {
      generatePresignedUrl({ data: { threadMessageId: message.id!, method: 'get' } })
        .then(({ url }) => setImageUrl(url));
    }
  }, [message]);

  console.log(messageMarked)
  
  return (
    <li className="flex flex-col">
      <div className={`px-4 py-2 border rounded
        ${message.role === 'user' ? 'self-end ml-4 bg-slate-100 border-slate-400 dark:bg-slate-800 dark:border-zinc-600' : 'self-start mr-4 bg-fuchsia-200 border-fuchsia-300 dark:bg-fuchsia-900 dark:border-fuchsia-950'}`}
      >
        {message.role === 'assistant' && message.state !== 'generating' && message.content && (
          <div 
            dangerouslySetInnerHTML={{ __html: messageMarked }} 
            className="prose dark:prose-invert"
          >
          </div>
        )}
        {message.role === 'assistant' && message.state === 'generating' && !message.content && (
          <p>Please wait a jiffy...</p>
        )}
        {message.role !== 'assistant' && (
          <div>
            <p>
              {message.content}
            </p>
            {imageUrl && (
              <img src={imageUrl} className="my-2 max-h-64" />
            )}
          </div>
        )}
      </div>
      <small className={`block my-1 text-slate-500 ${message.role === 'user' ? 'self-end' : ''}`}>
        {message.role === 'assistant' && (
          <MessageToolbar 
            message={message}
            onCopy={onCopy}
            onRegenerate={onRegenerate}
            recentlyCopied={recentlyCopied}
          />
        )}
        {/* <time dateTime={messageTime?.toISOString()}>{messageTime?.toLocaleString()}</time> */}
        {messageTime && (
          <RelativeTime 
            date={messageTime}
            className="text-slate-700 dark:text-slate-400"
            alignPopup={message.role === 'assistant' ? 'start' : 'end'}
          />
        )}
        {message.role === 'assistant' && timeTaken && ` (took ${timeTaken}s)`}
        {message.state === 'generating' && ' generating...'}
      </small>
    </li>
  )
};
