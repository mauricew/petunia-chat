import { threadMessagesTable } from "db/schema";
import { marked } from "marked";
import { useMemo } from "react";

type ChatMessageProps = {
  message: Partial<typeof threadMessagesTable.$inferSelect>
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const messageMarked = useMemo(() => marked(message.content!), [message]);
  
  return (
    <li className={`inline-block ${message.role === 'user' ? 'self-end ml-4' : 'self-start mr-4'}`}>
      <small className="block mb-1">
        {message.role}; {' '}
        <time dateTime={message.createdAt?.toISOString()}>{message.createdAt?.toLocaleString()}</time>
        {message.state === 'generating' && '; generating...'}
      </small>
      {message.role === 'assistant' && (
        <div 
          dangerouslySetInnerHTML={{ __html: messageMarked }} 
          className="px-4 py-3 border border-fuchsia-200 rounded"
        >
        </div>
      )}
      {message.role !== 'assistant' && (
        <p className="px-4 py-3 border border-slate-400 rounded-lg">
          {message.content}
        </p>
      )}
    </li>
  )
};
