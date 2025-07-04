type ChatInputProps = {
  isLoggedIn: boolean;
  isOutOfMessages: boolean;
  isRunning: boolean;
  messageInput: string | undefined;
  onMessageInputChange: (message: string) => void;
  onSubmit: (form: HTMLFormElement | null) => Promise<unknown>;
}

export default function ChatInput(props: ChatInputProps) {
  const { isLoggedIn, isOutOfMessages, isRunning, messageInput, onMessageInputChange, onSubmit } = props;

  return (
    <textarea 
      name="msg"
      className="w-full p-2 border border-fuchsia-200 border-r-transparent resize-none dark:border-fuchsia-700"
      placeholder={isRunning ? "Generating response..." : isOutOfMessages ? `Out of messages` : isLoggedIn ? "Chat away" : "For now I gotta have you log in to use this thing."}
      readOnly={!isLoggedIn || isRunning || isOutOfMessages}
      value={messageInput}
      onChange={e => onMessageInputChange(e.target.value)}
      onKeyDown={async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          await onSubmit(e.currentTarget.form!);
        }
      }}
    />
  )
}