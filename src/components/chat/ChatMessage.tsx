import { threadMessagesTable } from "db/schema";
import { marked } from "marked";
import { useMemo } from "react";

type ChatMessageProps = {
  message: Partial<typeof threadMessagesTable.$inferSelect>
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  
  const messageMarked = useMemo(() => marked(message.content!), [message]);
  
  return (
    <div className="inline-flex flex-col p-4 border">
      <small className="block mb-2">
        {message.role}; {' '}
        <time dateTime={message.createdAt?.toISOString()}>{message.createdAt?.toLocaleString()}</time>
        {message.state === 'generating' && '; generating...'}
      </small>
      {message.role === 'assistant' && (
        <div dangerouslySetInnerHTML={{ __html: messageMarked }}>
        </div>
      )}
      {message.role !== 'assistant' && (
        <p>
          {message.content}
        </p>
      )}
    </div>
  )
};
